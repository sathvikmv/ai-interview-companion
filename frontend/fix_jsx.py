import glob
files = glob.glob('src/**/*.tsx', recursive=True)
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    changed = False
    
    replacements = ['</div >', '</main >', '</section >', '</span >', '</button >', '</header >', '</p >', '/>']
    
    # Wait, the error screenshot says:
    # `x Unexpected token 'div'. Expected jsx identifier` 
    # `,-[C:\Users\Admin\full stack for vs code\ai-interview-platform\frontend\src\app\recruiter\page.tsx:26:1]`

    # Let's replace </div > with </div>
    new_content = content
    for r in replacements:
        if r in new_content:
            new_content = new_content.replace(r, r.replace(' ', ''))
            
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {file}")
