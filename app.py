from flask import Flask, render_template, send_from_directory

app = Flask(__name__)


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/service-worker.js")
def service_worker():
    return send_from_directory(app.static_folder, "service-worker.js", mimetype="application/javascript")


if __name__ == "__main__":
    app.run(debug=True)
