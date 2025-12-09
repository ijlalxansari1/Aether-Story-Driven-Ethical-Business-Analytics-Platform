import pandas as pd
import re

# Regex patterns for common PII
PATTERNS = {
    "Email": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
    "Phone": r'(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}',
    "SSN": r'\d{3}-\d{2}-\d{4}',
    "Credit Card": r'\b(?:\d[ -]*?){13,16}\b'
}

def scan_dataset(filepath: str, sample_size: int = 100):
    """
    Scans the first N rows of a dataset for PII patterns.
    Returns a list of warnings.
    """
    warnings = []
    
    try:
        # Determine file type and read
        if filepath.endswith('.csv'):
            df = pd.read_csv(filepath, nrows=sample_size)
        elif filepath.endswith('.xlsx'):
            df = pd.read_excel(filepath, nrows=sample_size)
        elif filepath.endswith('.json'):
            df = pd.read_json(filepath, nrows=sample_size)
        elif filepath.endswith('.parquet'):
            df = pd.read_parquet(filepath) # Parquet doesn't support nrows easily in all engines, but it's fast
            df = df.head(sample_size)
        else:
            return ["Unsupported file format for scanning."]

        # Scan each column
        for col in df.columns:
            # Convert to string for regex matching
            col_data = df[col].astype(str)
            
            for pii_type, pattern in PATTERNS.items():
                # Check if any value in the column matches the pattern
                # We use a simple check: if > 10% of non-null values match, flag it
                matches = col_data.apply(lambda x: bool(re.search(pattern, x)))
                match_count = matches.sum()
                
                if match_count > 0:
                    warnings.append({
                        "column": col,
                        "type": pii_type,
                        "count": int(match_count),
                        "message": f"Column '{col}' contains potential {pii_type} data."
                    })
                    # Break to avoid flagging same column for multiple things if one is found (optional, but keeps it clean)
                    # For now, we let it flag multiple if needed.

    except Exception as e:
        warnings.append({"error": f"Failed to scan dataset: {str(e)}"})
        
    return warnings
