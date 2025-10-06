open conda promt
conda activate interprepai_latest
cd interprepai/backend
pip install -r requirements.txt
uvicorn server:app --reload

open window terminal or cmd
cd interprepai/frontend
yarn start
yarn add posthog-node
