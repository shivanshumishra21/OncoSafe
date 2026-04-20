"""
External API integration for drug data
Uses RxNorm for drug search and interactions
Uses OpenFDA for warnings and toxicity information
"""
import requests
from functools import lru_cache
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST"
OPENFDA_BASE = "https://api.fda.gov/drug"


@lru_cache(maxsize=1000)
def search_drugs(query):
    """
    Search for drugs using RxNorm API
    Returns list of drugs with name, rxcui, and category
    """
    if not query or len(query) < 2:
        return []
    
    cache_key = f"drug_search_{query.lower()}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    try:
        url = f"{RXNORM_BASE}/drugs.json"
        params = {'name': query}
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        drugs = []
        
        if 'drugGroup' in data and 'conceptGroup' in data['drugGroup']:
            for group in data['drugGroup']['conceptGroup']:
                if 'conceptProperties' in group:
                    for concept in group['conceptProperties']:
                        drug = {
                            'name': concept.get('name', ''),
                            'rxcui': concept.get('rxcui', ''),
                            'category': _determine_category(concept.get('name', '')),
                            'synonym': concept.get('synonym', '')
                        }
                        drugs.append(drug)
        
        # Cache for 1 hour
        cache.set(cache_key, drugs, 3600)
        return drugs
        
    except requests.RequestException as e:
        logger.error(f"RxNorm API error: {e}")
        return []


def _determine_category(drug_name):
    """
    Determine if drug is chemotherapy or supportive based on name
    This is a simple heuristic - can be enhanced with more sophisticated logic
    """
    chemo_keywords = [
        'cisplatin', 'carboplatin', 'oxaliplatin',
        'methotrexate', 'fluorouracil', '5-fu',
        'doxorubicin', 'epirubicin', 'daunorubicin',
        'cyclophosphamide', 'ifosfamide',
        'paclitaxel', 'docetaxel',
        'vincristine', 'vinblastine',
        'etoposide', 'irinotecan', 'topotecan',
        'gemcitabine', 'cytarabine',
        'bleomycin', 'mitomycin'
    ]
    
    drug_lower = drug_name.lower()
    for keyword in chemo_keywords:
        if keyword in drug_lower:
            return 'Chemo'
    
    return 'Supportive'


@lru_cache(maxsize=500)
def get_interactions(rxcui_list_str):
    """
    Get drug interactions from RxNorm
    rxcui_list_str: comma-separated string of RxCUIs
    Returns list of interaction dictionaries
    """
    if not rxcui_list_str:
        return []
    
    cache_key = f"interactions_{rxcui_list_str}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    try:
        rxcuis = rxcui_list_str.split(',')
        all_interactions = []
        
        # Check interactions for each pair
        for i, rxcui1 in enumerate(rxcuis):
            for rxcui2 in rxcuis[i+1:]:
                url = f"{RXNORM_BASE}/interaction/list.json"
                params = {'rxcuis': f"{rxcui1}+{rxcui2}"}
                
                response = requests.get(url, params=params, timeout=5)
                response.raise_for_status()
                
                data = response.json()
                
                if 'fullInteractionTypeGroup' in data:
                    for type_group in data['fullInteractionTypeGroup']:
                        if 'fullInteractionType' in type_group:
                            for interaction_type in type_group['fullInteractionType']:
                                if 'interactionPair' in interaction_type:
                                    for pair in interaction_type['interactionPair']:
                                        interaction = _parse_interaction_pair(pair)
                                        if interaction:
                                            all_interactions.append(interaction)
        
        # Cache for 6 hours
        cache.set(cache_key, all_interactions, 21600)
        return all_interactions
        
    except requests.RequestException as e:
        logger.error(f"RxNorm interaction API error: {e}")
        return []


def _parse_interaction_pair(pair):
    """
    Parse interaction pair from RxNorm response
    """
    try:
        drug1_name = pair.get('interactionConcept', [{}])[0].get('minConceptItem', {}).get('name', 'Unknown')
        drug2_name = pair.get('interactionConcept', [{}])[1].get('minConceptItem', {}).get('name', 'Unknown') if len(pair.get('interactionConcept', [])) > 1 else 'Unknown'
        
        description = pair.get('description', 'No description available')
        severity = pair.get('severity', 'Unknown')
        
        # Map RxNorm severity to our system
        severity_map = {
            'high': 'Dangerous',
            'moderate': 'Moderate',
            'low': 'Safe',
            'N/A': 'Moderate'
        }
        
        mapped_severity = severity_map.get(severity.lower(), 'Moderate')
        
        return {
            'drug_pair': f"{drug1_name} + {drug2_name}",
            'severity': mapped_severity,
            'description': description
        }
    except (KeyError, IndexError) as e:
        logger.error(f"Error parsing interaction pair: {e}")
        return None


@lru_cache(maxsize=500)
def get_warnings(drug_name):
    """
    Get drug warnings and toxicity information from OpenFDA
    Returns dictionary with warnings, contraindications, and interactions
    """
    if not drug_name:
        return {}
    
    cache_key = f"warnings_{drug_name.lower()}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    try:
        url = f"{OPENFDA_BASE}/label.json"
        params = {
            'search': f'openfda.brand_name:"{drug_name}" OR openfda.generic_name:"{drug_name}"',
            'limit': 1
        }
        
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        warnings_data = {}
        
        if 'results' in data and len(data['results']) > 0:
            result = data['results'][0]
            
            # Extract warnings
            if 'warnings' in result:
                warnings_data['warnings'] = ' '.join(result['warnings']) if isinstance(result['warnings'], list) else result['warnings']
            
            # Extract contraindications
            if 'contraindications' in result:
                warnings_data['contraindications'] = ' '.join(result['contraindications']) if isinstance(result['contraindications'], list) else result['contraindications']
            
            # Extract drug interactions
            if 'drug_interactions' in result:
                warnings_data['drug_interactions'] = ' '.join(result['drug_interactions']) if isinstance(result['drug_interactions'], list) else result['drug_interactions']
            
            # Extract boxed warnings (most serious)
            if 'boxed_warning' in result:
                warnings_data['boxed_warning'] = ' '.join(result['boxed_warning']) if isinstance(result['boxed_warning'], list) else result['boxed_warning']
        
        # Cache for 24 hours (warnings don't change frequently)
        cache.set(cache_key, warnings_data, 86400)
        return warnings_data
        
    except requests.RequestException as e:
        logger.error(f"OpenFDA API error for {drug_name}: {e}")
        return {}


def get_drug_toxicity_summary(drug_name):
    """
    Get a concise toxicity summary for a drug
    Combines warnings from OpenFDA into a single summary
    """
    warnings = get_warnings(drug_name)
    
    if not warnings:
        return "Toxicity information not available"
    
    summary_parts = []
    
    if 'boxed_warning' in warnings:
        summary_parts.append(f"⚠️ BLACK BOX WARNING: {warnings['boxed_warning'][:200]}...")
    
    if 'warnings' in warnings:
        summary_parts.append(warnings['warnings'][:200] + "...")
    
    if 'contraindications' in warnings:
        summary_parts.append(f"Contraindications: {warnings['contraindications'][:150]}...")
    
    return ' | '.join(summary_parts) if summary_parts else "No specific warnings found"
