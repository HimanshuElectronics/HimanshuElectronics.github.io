# Himanshu Electronics website

Plain HTML, CSS and JavaScript. Hosted free on GitHub Pages.

## Add things from Termux (run inside the site folder)
| What | Command |
|---|---|
| New product | python3 tools/addproduct.py |
| New category | python3 tools/addcategory.py |
| New brand (logo optional) | python3 tools/addbrand.py |
| More photos for a product | python3 tools/addphoto.py |
| New worker for home service | python3 tools/addworker.py |
| Latest Update on the home page | python3 tools/addupdate.py |
| Before every push | python3 tools/bump.py |

## Data files (data/)
products.json, categories.json, brands.json, workers.json, updates.json
Photos: assets/images/products/ and assets/images/brands/

## Preview
python3 -m http.server 8080  then open http://localhost:8080
