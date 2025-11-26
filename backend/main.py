from fastapi import FastAPI, Depends
from models import Product
import database_models
from database import session, engine
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database_models.Base.metadata.create_all(bind=engine)

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_home_page():
    return("Hi. Its me Tibra")

@app.get("/products", response_model=list[Product])
def read_all_products(db:Session = Depends(get_db)):
    products = db.query(database_models.Product).order_by(database_models.Product.id.asc()).all()
    return products

@app.get("/product/{id}", response_model=Product)
def get_product_by_id(id:int, db:Session = Depends(get_db)):
    product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if product:
        return product
    return {"Message":"Product not found"}

@app.post("/product", response_model = Product)
def add_product(product:Product, db:Session = Depends(get_db)):
    new_product = database_models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.put("/product", response_model=Product)
def update_product(id:int, product:Product, db:Session = Depends(get_db)):
    existing_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if existing_product:
        existing_product.name = product.name
        existing_product.description = product.description
        existing_product.price = product.price
        existing_product.quantity = product.quantity
        db.commit()
        db.refresh(existing_product)
        return existing_product
    return {"Message":"Product not found"}
    

@app.delete("/product")
def delete_product(id:int, db:Session = Depends(get_db)):
    existing_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if existing_product:
        db.delete(existing_product)
        db.commit()
        return {"Message":"Product deleted successfully"}
    return {"Message":"Product not found"}




