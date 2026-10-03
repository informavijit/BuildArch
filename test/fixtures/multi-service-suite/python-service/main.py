from fastapi import FastAPI

app = FastAPI()

@app.get("/analytics")
def get_analytics():
    return {"status": "ok", "metrics": 42}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
