# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt ./

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container at /app
# This assumes Dockerfile is in the same directory as the code to be copied
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 8008

# Define environment variable for the database connection
# This can be overridden in docker-compose.yml
# Using lowercase 'htxsale' as identified in previous checks
ENV DATABASE_URL=postgresql://user:password@db:5432/HTXSale

# Run app.py when the container launches using gunicorn
# Use the corrected host '0.0.0.0'
CMD ["gunicorn", "--bind", "0.0.0.0:8008", "app:app"]

