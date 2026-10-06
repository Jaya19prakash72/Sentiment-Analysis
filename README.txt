Project Directory Structure

Sentiment_Analysis_Dashboard/
│
├── app.py                             # Application entry point & API route handlers
├── requirements.txt                   # Dependency manifest (Flask==3.1.2)
├── README.md                          # Project documentation
│
├── model/                             # Machine learning inference logic
│   ├── __init__.py                    # Python package initializer
│   └── sentiment_model.py             # Prediction & classification logic
│
├── data/                              # Data persistence layer
│   ├── sentiment_data.csv             # Training/baseline sample dataset
│   └── analysis_history.csv           # Historical record of user queries & results
│
├── static/                            # Frontend static assets
│   ├── css/
│   │   └── style.css                  # UI layout, responsive styling, and color schemes
│   └── js/
│       └── app.js                     # DOM events, AJAX fetch requests, and graph updates
│
└── templates/                         # Server-rendered views
    └── index.html                     # Main dashboard page layout


+--------------------------------------------------------------+
|                     Client Browser UI                        |
|                                                              |
|   [ index.html ] <---> [ style.css ] <---> [ app.js ]        |
+------------------------------+-------------------------------+
                               |
                   HTTP POST   |  JSON Response
                  (fetch /api) |  (sentiment, score, history)
                               v
+--------------------------------------------------------------+
|                   Flask Web Server (app.py)                  |
|                                                              |
|  * Route: "/"          -> Renders main dashboard             |
|  * Route: "/analyze"  -> Receives text & triggers analysis   |
|  * Route: "/history"  -> Fetches prior query records         |
+-------------------+----------------------+-------------------+
                    |                      |
                    v                      v
+--------------------------+    +------------------------------+
|  ML Model Layer          |    |  Data Storage Layer (CSV)    |
|  (sentiment_model.py)    |    |                              |
|                          |    |  * analysis_history.csv      |
|  * Text preprocessing    |    |    (Logs queries & scores)   |
|  * Sentiment score calc  |    |  * sentiment_data.csv        |
|  * Label classification  |    |    (Reference dataset)       |
+--------------------------+    +------------------------------+


[ User Enters Text ]
         │
         ▼
[ Click "Analyze" Button ]
         │
         ▼
[ app.js captures submit event ]
         │
         ├──► Validates non-empty input
         └──► Sends POST request with text payload to Flask endpoint (e.g. /analyze)
                     │
                     ▼
       [ Flask Router in app.py ]
                     │
                     ▼
       [ model/sentiment_model.py ]
                     │
                     ├──► Step 1: Preprocess string (tokenization, cleaning)
                     ├──► Step 2: Compute sentiment polarity score
                     └──► Step 3: Classify label (Positive / Neutral / Negative)
                                  │
                                  ▼
           [ Log Entry to data/analysis_history.csv ]
           (Timestamp, Input Text, Polarity Score, Classification)
                                  │
                                  ▼
            [ Flask generates JSON Response Payload ]
                                  │
                                  ▼
       [ app.js receives response in the Browser ]
                     │
                     ├──► Step 1: Hide loading indicator
                     ├──► Step 2: Display sentiment badge and score
                     └──► Step 3: Append new entry to the live History Table/Chart


Component Details & Responsibilities
1.	app.py (Controller Layer)
o	Initializes the Flask application.
o	Defines web routes:
	GET /: Renders templates/index.html as the initial user view.
	POST /analyze (or corresponding API route): Accepts JSON payloads containing the user's input string, delegates scoring to sentiment_model.py, appends the log to analysis_history.csv, and returns JSON.
	GET /history: Reads and provides prior analysis entries from analysis_history.csv to populate the frontend table.
2.	model/sentiment_model.py (Domain / ML Layer)

o	Contains the core NLP pipeline logic.
o	Parses the incoming raw string, evaluates sentiment intensity, and maps numeric scores to categorical labels (Positive, Neutral, Negative).
3.	data/ (Persistence Layer)

o	sentiment_data.csv: Contains pre-existing reference samples or training/benchmark data.
o	analysis_history.csv: Acts as a lightweight append-only log storing timestamp, text snippets, and inference results across sessions.
4.	templates/index.html & static/ (Presentation Layer)

o	index.html: Form elements for input, target containers for sentiment labels/charts, and tables for past run histories.
o	style.css: Provides layout hierarchy, clean typography, dynamic color indicators (e.g., green for positive, red for negative), and responsive design.
o	app.js: Prevents standard page refreshes using asynchronous fetch() API calls, updates the DOM in real-time, and refreshes the history list dynamically

