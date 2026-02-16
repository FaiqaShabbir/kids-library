"""
Compress PDF files for web deployment.

Your PDFs are too large (260-300MB each). This script will compress them.
"""

import os
import subprocess
import shutil

INPUT_DIR = "storage/pdfs"
OUTPUT_DIR = "storage/pdfs_compressed"

def compress_with_ghostscript():
    """
    Use Ghostscript to compress PDFs (if installed).
    This is the best compression method.
    """
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for filename in os.listdir(INPUT_DIR):
        if not filename.endswith('.pdf'):
            continue
        
        input_path = os.path.join(INPUT_DIR, filename)
        output_path = os.path.join(OUTPUT_DIR, filename)
        
        input_size = os.path.getsize(input_path) / (1024 * 1024)
        print(f"\nCompressing: {filename}")
        print(f"  Original size: {input_size:.1f} MB")
        
        # Try Ghostscript compression
        try:
            result = subprocess.run([
                'gswin64c',  # or 'gs' on Linux/Mac
                '-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.4',
                '-dPDFSETTINGS=/ebook',  # Good quality for web
                '-dNOPAUSE',
                '-dBATCH',
                '-dQUIET',
                f'-sOutputFile={output_path}',
                input_path
            ], capture_output=True, timeout=300)
            
            if result.returncode == 0:
                output_size = os.path.getsize(output_path) / (1024 * 1024)
                reduction = (1 - output_size / input_size) * 100
                print(f"  Compressed size: {output_size:.1f} MB ({reduction:.0f}% reduction)")
            else:
                print(f"  Ghostscript error: {result.stderr.decode()[:100]}")
                
        except FileNotFoundError:
            print("  Ghostscript not found. Please install it or compress manually.")
            print("  Download: https://ghostscript.com/releases/gsdnld.html")
            return False
        except Exception as e:
            print(f"  Error: {e}")
            return False
    
    return True


def show_instructions():
    print("""
============================================================
YOUR PDFs ARE TOO LARGE FOR WEB DEPLOYMENT
============================================================

Current sizes:
""")
    
    for filename in os.listdir(INPUT_DIR):
        if filename.endswith('.pdf'):
            size = os.path.getsize(os.path.join(INPUT_DIR, filename)) / (1024 * 1024)
            print(f"  {filename}: {size:.0f} MB")
    
    print("""
============================================================
OPTIONS TO FIX THIS:
============================================================

OPTION 1: Use an Online Compressor (Easiest)
  1. Go to https://www.ilovepdf.com/compress_pdf
  2. Upload each PDF and compress
  3. Download compressed versions
  4. Replace files in storage/pdfs/

OPTION 2: Install Ghostscript (Best Quality)
  1. Download from: https://ghostscript.com/releases/gsdnld.html
  2. Install it
  3. Run this script again

OPTION 3: Use Adobe Acrobat or other PDF software
  - Save as "Reduced Size PDF" or "Optimized PDF"

TARGET: Each PDF should be under 10 MB for Cloudinary free tier
============================================================
""")


if __name__ == "__main__":
    print("Checking for Ghostscript...")
    
    # Check if Ghostscript is available
    try:
        result = subprocess.run(['gswin64c', '--version'], capture_output=True)
        print("Ghostscript found! Compressing...")
        compress_with_ghostscript()
    except FileNotFoundError:
        show_instructions()
