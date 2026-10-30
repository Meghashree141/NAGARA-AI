# NAGARA AI

### From Citizen Voice to Intelligent Civic Action

NAGARA AI is an AI-powered civic complaint intelligence platform that transforms unstructured citizen complaints into organised, prioritised and actionable civic information.

The platform helps citizens report civic issues and allows administrators to monitor complaints, identify priority issues, track progress and understand geographical patterns.

## Problem Statement

Citizens frequently face difficulties reporting and tracking civic problems such as damaged roads, waterlogging, waste accumulation, streetlight failures and water supply interruptions.

Traditional complaint systems can make it difficult to organise complaints, identify urgent cases, detect duplicates and understand where civic problems are concentrated.

## Our Solution

NAGARA AI provides a centralised platform for submitting, analysing and monitoring civic complaints.

It uses rule-based text analysis to categorise complaints, estimate their priority, identify possible duplicates and map them to relevant departments.

## Key Features

* Citizen complaint submission
* Automatic complaint categorisation
* Priority assessment
* Duplicate complaint detection
* Department recommendation
* Complaint tracking using report ID
* Administrator dashboard
* Complaint status management
* Officer assignment
* Analytics and visualisation
* Geographical complaint mapping

## Technology Stack

| Component     | Technology              |
| ------------- | ----------------------- |
| Frontend      | React, Vite, JavaScript |
| Backend       | Node.js, Express.js     |
| Database      | SQLite, better-sqlite3  |
| Maps          | Leaflet, OpenStreetMap  |
| Charts        | Recharts                |
| HTTP Requests | Axios                   |
| Icons         | Lucide React            |

## System Architecture

1. Citizens submit complaints through the React frontend.
2. The Express backend validates incoming complaint data.
3. The analysis engine categorises the complaint and estimates priority.
4. The duplicate detection module compares the complaint with existing records.
5. Complaint information is stored in SQLite.
6. Administrators view complaints, update statuses and assign officers.
7. The analytics module provides complaint statistics and geographical insights.

## Complaint Intelligence

The current prototype uses deterministic, rule-based text analysis.

* Categorisation uses keyword matching.
* Priority assessment uses a weighted rule-based scoring system.
* Duplicate detection uses lexical Jaccard similarity.
* Department mapping uses predefined category-to-department rules.

These components are designed as an extensible foundation for future machine-learning and semantic NLP integration.

## Testing

The following functional test scenarios should be verified:

| Test                                            | Expected Result                    |
| ----------------------------------------------- | ---------------------------------- |
| Submit a valid complaint                        | Complaint is created               |
| Submit without required fields                  | Validation error is returned       |
| Submit a road damage complaint                  | Road-related category is assigned  |
| Submit an urgent complaint                      | Priority is assessed               |
| Submit a similar complaint at the same location | Possible duplicate is detected     |
| Track an existing complaint ID                  | Complaint details are displayed    |
| Track an invalid complaint ID                   | Not-found response is displayed    |
| Update complaint status                         | New status is saved                |
| Assign an officer                               | Officer assignment is saved        |
| Load analytics dashboard                        | Complaint statistics are displayed |
| Load geographical map                           | Complaint locations are displayed  |

Only mark a test as passed after actually running it.

## Security and Reliability Considerations

* Backend input validation for complaint submissions.
* Required-field and input-length checks.
* Parameterised database operations through the database library.
* CORS configuration for frontend-backend communication.
* Environment-based configuration for deployment.

This is a hackathon prototype. Production deployment would require administrator authentication, role-based authorisation, rate limiting, stronger security controls and durable database storage.

## Future Enhancements

* Machine-learning-based complaint classification.
* Semantic duplicate detection using embeddings.
* Multilingual complaint processing.
* Secure administrator authentication.
* SMS and email notifications.
* Persistent cloud database integration.
* Real-time civic authority integrations.
* Advanced hotspot prediction and analytics.

## Live Project

Frontend: https://nagara-ai-frontend.onrender.com/

Backend: https://nagara-ai-ibum.onrender.com/

GitHub: https://github.com/Meghashree141/NAGARA-AI

## Project Objective

To make civic complaint reporting more organised, transparent and data-driven by converting citizen feedback into actionable civic intelligence.

**NAGARA AI — From Citizen Voice to Intelligent Civic Action.**
