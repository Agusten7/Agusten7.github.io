from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json
import time
import base64
import os

app = Flask(__name__)

CORS(app)

# API PATH

@app.route('/api/get-videos')
def get_videos():
    url = "http://127.0.0.1:8081/rate-videos/videos.json"
    data = requests.get(url)
    data_json = json.loads(data.text)
    
    for video in data_json["videos"]:
        if len(video["title"]) > 60:
            video["title"] = video["title"][0:60] + "..."
            
    return data_json

def get_aws_upload_data():
    url = "https://ar.pinterest.com/resource/VIPResource/create/"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Csrftoken": "2e46f1772d09b42eeed2e55aef05974c"
    }
    
    cookies = {
        "csrftoken": "2e46f1772d09b42eeed2e55aef05974c",
        "_pinterest_sess": "test"
    }
    
    data = {
        "data":"{\"options\":{\"type\":\"pinimage\",\"aux_data\":{}},\"context\":{}}"
    }
    
    burp ={"http":"http://127.0.0.1:8080", "https":"http://127.0.0.1:8080/"}
    
    upload_data = requests.post(url, headers=headers, cookies=cookies, data=data, proxies=burp, verify=False)
    
    upload_data_json = json.loads(upload_data.text)
    
    aws_upload_data = upload_data_json["resource_response"]["data"]
    
    print("[+] AWS data obtained")
    
    return aws_upload_data

def upload_image_aws(aws_upload_data, image):
    url = 'https://pinterest-media-upload.s3.amazonaws.com'
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
    }
    
    data = {
        "x-amz-date": aws_upload_data["upload_parameters"]["x-amz-date"],
        "x-amz-signature": aws_upload_data["upload_parameters"]["x-amz-signature"],
        "x-amz-security-token": aws_upload_data["upload_parameters"]["x-amz-security-token"],
        "x-amz-algorithm": aws_upload_data["upload_parameters"]["x-amz-algorithm"],
        "key": aws_upload_data["upload_parameters"]["key"],
        "policy": aws_upload_data["upload_parameters"]["policy"],
        "x-amz-credential": aws_upload_data["upload_parameters"]["x-amz-credential"],
        "Content-Type": aws_upload_data["upload_parameters"]["Content-Type"]
    }
    
    burp = {"http":"http://127.0.0.1:8080/","https":"http://127.0.0.1:8080/"}
    
    files = {
        "file": ("blob", image, 'image/jpg')
    }
    
    response = requests.post(url, headers=headers, data=data, files=files, proxies=burp, verify=False)
    
    print(f"[+] Image uploaded to Pinterest AWS, Status Code: {response.status_code}")
    
def get_image_url(upload_id):
    url = "https://ar.pinterest.com/resource/VIPResource/get/?data=%7B\"options\":%7B\"upload_ids\":%5B\"{}\"%5D%7D%7D".format(upload_id)
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
    }
    
    cookies = {
        "_pinterest_sess": "test"
    }
    
    burp = {"https":"http://127.0.0.1:8080"}
    
    response = requests.get(url, headers=headers, cookies=cookies, proxies=burp, verify=False)
    
    json_data = json.loads(response.text)
    
    upload_id_data = json_data["resource_response"]["data"][upload_id]
    
    signature = upload_id_data["signature"]
    
    first = signature[0:2]
    second = signature[2:4]
    third = signature[4:6]
    
    url = f"https://i.pinimg.com/1200x/{first}/{second}/{third}/{signature}.jpg"
    
    print(f"[+] Image URL: {url}")
    
    return url
    
def upload_image_to_pinterest(image):
    aws_upload_data = get_aws_upload_data()
    upload_id = aws_upload_data["upload_id"]
    
    print(f"[+] upload_id: {upload_id}")
    
    time.sleep(2)
    upload_image_aws(aws_upload_data, image)
    time.sleep(2)
    image_url = get_image_url(upload_id)
    
    return image_url
    
# API PATH

@app.route('/api/post-video', methods=['POST'])
def post_new_video():
    data = request.get_json()
    user_id = data["user_id"]
    title = data["title"]
    thumbnail_base64 = data["thumbnail"]
    
    response = check_points(user_id)
    
    
    try:
        if response["sufficient_points"] == "false":
            return {"message":"You don't have sufficient points"}
    except KeyError:
        return response
    
    with open(users_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        
        for user in data["users"]:
            if user["user_id"] == user_id:
                user["points"] -= 5                    
                    
    with open(users_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
        print(f"User {user_id} now has {user['points']} points")   
        
        
    if 'base64,' in thumbnail_base64:
        thumbnail_base64 = thumbnail_base64.split('base64,')[1]

    image = base64.b64decode(thumbnail_base64)
    
    image_url = upload_image_to_pinterest(image)
    
    new_video = {"id":"test","thumbnail": image_url, "title":title, "shown":0,"views":0}
    
    videos_path = '../rate-videos/videos.json'
    
    with open(videos_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        str_id = str(len(data["videos"]))
        new_video["id"] = str_id
        data["videos"].append(new_video)
        
        
    with open(videos_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
        print("file edited")
        
    users_path = '../rate-videos/users.json'
    
    
    return {"response":{"message":"The video was uploaded successfully", "data": new_video}}
    
@app.route('/api/update_data', methods=['POST'])
def update_data():
    data = request.get_json()
    print("A"*100)
    print(data)
    print("A"*100)
    shown_video_ids = data["shown_video_ids"]
    
    videos_path = '../rate-videos/videos.json'
    
    with open(videos_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        
        for video_id in shown_video_ids:
            for video in data["videos"]:
                if video["id"] == video_id:
                    video["shown"] += 1
                
    with open(videos_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
        print("file edited")    
    
    return {"response":{"message":"Data successfully updated"}}
    
    
@app.route('/api/reset_data', methods=['POST'])
def reset_data():
    data = request.get_json()
    
    videos_path = '../rate-videos/videos.json'
    
    if data["action"] == "reset":
        with open(videos_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
            for video in data["videos"]:
                video["shown"] = 0
                video["views"] = 0
    
        with open(videos_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False, indent=4)
            print("file edited")    
    
    return {"response":{"message":"Reset completly"}}
    
@app.route('/api/update_views', methods=['POST'])
def update_views():
    data = request.get_json()
    
    video_id = data["video_id"]
    
    videos_path = '../rate-videos/videos.json'
    
    with open(videos_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        
        for video in data["videos"]:
            if video["id"] == video_id:
                video["views"] += 1
                
    with open(videos_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
        print("file edited")    
    
    return {"response":{"message":"Data successfully updated"}}

@app.route('/api/update-users', methods=['POST'])
def update_users():
    data = request.get_json()
    
    user_id = data["user_id"]
    
    users_path = '../rate-videos/users.json'
    
    with open(users_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        
        for user in data["users"]:
            if user["user_id"] == user_id:
                user["points"] += 1
                
    with open(users_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
        print("file edited")    
    
    return {"response":{"message":"Users data successfully updated"}}
    
@app.route('/api/create-user', methods=['POST'])
def create_user():
    data = request.get_json()
    
    user_id = data["user_id"]
    
    new_user = {"user_id": user_id, "points": 0}
    
    users_path = '../rate-videos/users.json'
    
    with open(users_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        
        data["users"].append(new_user)
        
    with open(users_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
        print(f"User {user_id} created")    
    
    return {"response":{"message": f"User {user_id} was successfully created"}}

@app.route('/api/check-points', methods=['POST'])
def check_points(user_id=""):
    data = request.get_json()
    
    user_id = data["user_id"]
    
    users_path = '../rate-videos/users.json'
    print(f"USER: {user_id}")
    
    
    with open(users_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        print(data)
        
        user_found = []
        
        try:
            for user in data["users"]:
                if user["user_id"] == user_id:
                    user_found.append(1)
        except KeyError:
            return {"message":"Error in the request"}
        
        if len(user_found) == 0:
            return {"message":"User ID Not Found"}

        for user in data["users"]:
            print(f"{user['user_id'] != {user_id}}")
            if user["user_id"] == user_id:
                if user["points"] >= 5:
                    
                    with open(users_path, 'w', encoding='utf-8') as file:
                        json.dump(data, file, ensure_ascii=False, indent=4)
                        print(f"User {user_id} now has {user['points']} points")   
                    return {"sufficient_points":"true"}       
                else:
                    return {"sufficient_points":"false"}
        
    return {"message":"Creo que aca no deberias llegar nunca XD"}
    

if __name__ == '__main__':
    app.run(debug=True)
    






