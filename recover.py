import json
import os

transcript_path = r"C:\Users\ravee\.gemini\antigravity-ide\brain\9c22f419-38fc-4847-9efe-77c1c71257e2\.system_generated\logs\transcript_full.jsonl"
files_to_recover = ["App.jsx", "index.css", "Agents.jsx", "Settings.jsx", "package.json"]

recovered = {}

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("type") == "PLANNER_RESPONSE":
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    if tc.get("function") == "default_api:write_to_file":
                        args = tc.get("arguments", {})
                        target = args.get("TargetFile", "")
                        for fname in files_to_recover:
                            if target.endswith(fname):
                                recovered[fname] = args.get("CodeContent", "")
                    elif tc.get("function") == "default_api:replace_file_content" or tc.get("function") == "default_api:multi_replace_file_content":
                        # We might need to handle this differently, but write_to_file is usually used for full creation.
                        pass
        except:
            pass

for fname, content in recovered.items():
    print(f"--- RECOVERED {fname} ---")
    print(content[:200] + "..." if len(content) > 200 else content)
    
    # Let's save them locally
    with open(fname, "w", encoding="utf-8") as out:
        out.write(content)
