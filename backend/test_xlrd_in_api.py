"""Script de teste para verificar xlrd na API"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/test-xlrd")
def test_xlrd():
    try:
        import xlrd
        return JSONResponse({
            "xlrd_available": True,
            "xlrd_version": xlrd.__version__,
            "xlrd_location": xlrd.__file__
        })
    except ImportError as e:
        return JSONResponse({
            "xlrd_available": False,
            "error": str(e)
        }, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
