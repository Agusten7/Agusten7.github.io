from flask import Flask, jsonify, request
import json
app = Flask(__name__)

@app.route('/')
def root():
    return 'Hola papa, me alegra que me hayas creado'

@app.route('/hi/<username>')
def hi_user(username):
    query = request.args.get("query")
    
    if query:
        
        query = json.loads(query)
        edad = query["edad"]
        return f"Hola {username}, se que tienes {edad} anios"
    else:
        return f"Hola {username}"

@app.route('/suma', methods=['POST'])
def sumar():
    data = request.get_json()
    num1 = data["num1"]
    num2 = data["num2"]
    
    resultado = num1 + num2
    
    return f"La suma de tu operacion es {resultado}"


if __name__ == '__main__':
    app.run(debug=True)


