import os
import zipfile

def create_zip(source_dir, output_filename, exclude_dirs):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                file_path = os.path.join(root, file)
                if file_path == os.path.join(source_dir, output_filename) or file == 'arama-project-ready.zip':
                    continue
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)

if __name__ == '__main__':
    source = r'c:\Users\erfanali\Desktop\arama-main'
    output = r'c:\Users\erfanali\Desktop\arama-main\arama-github-ready.zip'
    excludes = {'node_modules', '.next', '.git'}
    create_zip(source, output, excludes)
    print("Zip created successfully at " + output)
