from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Dummy data for inventory
inventory_data = [
    {"id": 1, "name": "Wireless Mouse", "category": "Electronics", "stock": 45, "price": 29.99, "status": "In Stock"},
    {"id": 2, "name": "Mechanical Keyboard", "category": "Electronics", "stock": 12, "price": 89.99, "status": "Low Stock"},
    {"id": 3, "name": "Ergonomic Chair", "category": "Furniture", "stock": 5, "price": 199.99, "status": "Critical"},
    {"id": 4, "name": "Desk Lamp", "category": "Office Supplies", "stock": 120, "price": 15.50, "status": "In Stock"},
    {"id": 5, "name": "Monitor Stand", "category": "Accessories", "stock": 0, "price": 45.00, "status": "Out of Stock"},
    {"id": 6, "name": "MacBook Pro", "category": "Electronics", "stock": 8, "price": 1299.00, "status": "Low Stock"},
    {"id": 7, "name": "Standing Desk", "category": "Furniture", "stock": 25, "price": 499.00, "status": "In Stock"},
    {"id": 8, "name": "HD Webcam", "category": "Accessories", "stock": 60, "price": 59.99, "status": "In Stock"},
    {"id": 9, "name": "Noise Cancelling Headphones", "category": "Electronics", "stock": 3, "price": 249.99, "status": "Critical"},
    {"id": 10, "name": "Whiteboard", "category": "Office Supplies", "stock": 15, "price": 85.00, "status": "In Stock"},
]

# Dummy data for insights
insights_data = {
    "total_value": sum(item["stock"] * item["price"] for item in inventory_data),
    "total_sales": sum(item["stock"] * item["price"] for item in inventory_data if item["status"] == "In Stock"),
    "total_sales_stock": sum(item["stock"] for item in inventory_data if item["status"] == "In Stock"),
    "total_items": sum(item["stock"] for item in inventory_data),
    "low_stock_count": len([i for i in inventory_data if i["stock"] < 15 and i["stock"] > 0]),
    "out_of_stock_count": len([i for i in inventory_data if i["stock"] == 0])
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/inventory')
def get_inventory():
    return jsonify(inventory_data)

@app.route('/api/insights')
def get_insights():
    # Recalculate on each request to simulate dynamic data
    current_insights = {
        "total_value": sum(item["stock"] * item["price"] for item in inventory_data),
        "total_sales": sum(item["stock"] * item["price"] for item in inventory_data if item["status"] == "In Stock"),
        "total_sales_stock": sum(item["stock"] for item in inventory_data if item["status"] == "In Stock"),
        "total_items": sum(item["stock"] for item in inventory_data),
        "low_stock_count": len([i for i in inventory_data if i["stock"] < 15 and i["stock"] > 0]),
        "out_of_stock_count": len([i for i in inventory_data if i["stock"] == 0])
    }
    return jsonify(current_insights)

@app.route('/api/chart-data')
def get_chart_data():
    categories = {}
    for item in inventory_data:
        cat = item['category']
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += item['stock']
        
    return jsonify({
        "labels": list(categories.keys()),
        "values": list(categories.values())
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
