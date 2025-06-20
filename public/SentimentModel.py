import pandas as pd
import re
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer

# Load the CSV file
from hdbcli import dbapi
import pandas as pd

# Correct connection details
hana_host = '3f2d9cd9-3a2c-4445-83ee-0c1302e0dda7.hana.trial-us10.hanacloud.ondemand.com'
hana_port = 443
hana_user = 'DBADMIN'
hana_password = 'Postman420'
hana_schema = 'DBADMIN'  # Ensure this is in uppercase if using default schema
hana_table = 'DTE2'  # Ensure this is in uppercase if using default table

try:
    # Establish connection to SAP HANA
    connection = dbapi.connect(
        address=hana_host,
        port=hana_port,
        user=hana_user,
        password=hana_password,
        encrypt='true',  # Use SSL encryption for cloud instances
        sslValidateCertificate='false'  # Disable SSL certificate validation if necessary
    )

    cursor = connection.cursor()

    # Construct the SQL query to select all records from the table
    select_sql = f'SELECT * FROM "{hana_schema}"."{hana_table}"'

    # Execute the query
    cursor.execute(select_sql)

    # Fetch all results
    results = cursor.fetchall()

    ## Get column names
    column_names = [desc[0] for desc in cursor.description]

    # Create a DataFrame from the fetched results
    df = pd.DataFrame(results, columns=column_names)

    # Save the DataFrame to a CSV file
    csv_file_path = 'reviews.csv'
    df.to_csv(csv_file_path, index=False)

    print(f"Data saved to {csv_file_path} successfully.")

    cursor.close()
    connection.close()

except dbapi.Error as e:
    print(f"Connection failed: {e}")
file_path = 'reviews.csv'
new_data = pd.read_csv(file_path)

# Ensure the CSV file has the same 'text' column as in the training data
print(new_data.head())

with open('trained_model3.sav', 'rb') as model_file:
    loaded_model = pickle.load(model_file)
with open('vectorizer3.sav', 'rb') as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

# Preprocess the data
port_stem = PorterStemmer()
stopwords_list = [
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
    'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was',
    'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the',
    'and',
    'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
    'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on',
    'off',
    'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
]

stopwords_list = set(stopwords_list)


def stemming(content):
    stemmed_content = re.sub('[^a-zA-Z]', ' ', content)
    stemmed_content = stemmed_content.lower()
    stemmed_content = stemmed_content.split()
    stemmed_content = [port_stem.stem(word) for word in stemmed_content if word not in stopwords_list]
    stemmed_content = ' '.join(stemmed_content)
    return stemmed_content


new_data['stemmed_content'] = new_data['Review Text'].apply(stemming)

# Transform the data using the loaded vectorizer
X_new = vectorizer.transform(new_data['stemmed_content'].values)

# Make predictions
predictions = loaded_model.predict(X_new)

# Add a new column to the DataFrame with the prediction results
new_data['sentiment'] = ['Positive' if prediction == 0 else 'Negative' for prediction in predictions]

# Save the updated DataFrame to a new CSV file
new_data.to_csv('updated_reviews.csv', index=False)

# Print the first few rows of the updated DataFrame
print(new_data.head())
