"""Direct test of Valyu API to debug the issue."""
import os
from dotenv import load_dotenv

load_dotenv()

# Test Valyu import and initialization
try:
    from valyu import Valyu
    print("✓ Valyu module imported successfully")

    api_key = os.getenv("VALYU_API_KEY")
    print(f"✓ API key loaded: {api_key[:10]}...")

    valyu = Valyu(api_key=api_key)
    print(f"✓ Valyu client created: {type(valyu)}")
    print(f"  Valyu client attributes: {dir(valyu)}")

    # Test a simple search
    print("\n" + "="*60)
    print("Testing Valyu search...")
    print("="*60)

    test_prompt = """
Search the web for local plumbing companies near London, UK (latitude: 51.524064, longitude: -0.084578)
within a 5 mile radius that can provide services for: Kitchen sink is leaking

Return results as valid JSON with company information.
"""

    print("Calling valyu.search()...")
    response = valyu.search(test_prompt)

    print(f"\n✓ Response received!")
    print(f"  Response type: {type(response)}")
    print(f"  Response attributes: {dir(response)}")

    if hasattr(response, 'model_dump'):
        print(f"\n  Response data:")
        import json
        print(json.dumps(response.model_dump(), indent=2))
    else:
        print(f"\n  Response content:")
        print(response)

except Exception as e:
    print(f"\n✗ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
