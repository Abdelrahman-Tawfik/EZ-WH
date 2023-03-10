# Project Estimation  
Date:       04/09/2022
Version:    1.0


# Estimation approach
- [Estimate by size](#estimate-by-size)
- [Estimate by product decomposition](#estimate-by-product-decomposition)
- [Estimate by activity decomposition](#estimate-by-activity-decomposition)
- [Summary](#summary)

# Estimate by size
### 
| Title                                                                                                   | Estimated number |
| ------------------------------------------------------------------------------------------------------- | ---------------- |
| NC =  Estimated number of classes to be developed                                                       | 20     |
| A = Estimated average size per class, in LOC                                                            | 800    |
| S = Estimated size of project, in LOC (= NC * A)                                                        | 16.000 |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                    | 1.600  |
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                     | 48.000 |
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) | 10     |


# Estimate by product decomposition
### 
| Component name       | Estimated effort (person hours) |
| -------------------- | ------------------------------- | 
| Requirement document | 320 |
| GUI prototype        | 160 |
| design document      | 320 |
| Code                 | 640 |
| Unit tests           | 160 |
| API tests            | 160 |
| Management documents | 320 |



# Estimate by activity decomposition
### 
| Activity name                         | Estimated effort (person hours) |
| ------------------------------------- | ------------------------------- |
| **1. Requirement document**           ||
| - Context Diagram and Interfaces      | 16 |
| - Functional Requirements             | 48 |
| - Non-funcional Requirements          | 32 |
| - Use cases                           | 32 |
| - Other                               | 40 |
| **2 . GUI prototype**                 ||
| - WH manager GUI                      | 40 |
| - WH employee GUI                     | 32 |
| - Admin GUI                           | 32 |
| - Other                               | 32 |
| **3. Design document**                | 320 |
| **4. Code**                           ||
| - Model                               | 160 |
| - View                                | 160 |
| - Controller                          | 320 |
|**5. Unit tests**                      | 100 |
| **6. API tests**                      | 100 |
| **7. Management documents**           | 320 |

# Milestones
### 
| Milestone name              | Estimated date |             
| --------------------------- | -------------- | 
| End of requirement planning | 28/03 |
| End of GUI protyping        | 18/04 |
| End of design phase         | 02/05 |
| End of implementation       | 30/05 |

# Deliverables
### 
| Deliverable name      | Estimated date |
| --------------------- | -------------- |
| Requirements document | 28/03 |
| GUI prototype         | 18/04 |
| Design document       | 02/05 |
| Software release      | 30/05 |

# Gantt Chart
###
[Link to Gantt Chart PDF](Diagrams/GanttChart1033.pdf)

# Summary
### 
| Title                              | Estimated effort | Estimated duration |
| ---------------------------------- | ---------------- | ------------------ |
| estimate by size                   | 1.600 ph         | 10 weeks                                 |
| estimate by product decomposition  | 2.080 ph         | 13 weeks                                 |
| estimate by activity decomposition | 1784 ph          | 6.5 weeks (According to the Gantt chart) |

We have assumed for duration a team of 4 people, 8 hours per day, 5 days per week. After calculating the estimations, it seems that activity decomposition produces the smallest estimated duration which also seems to the most accurate one. The reason for this small estimated duration is the parallezitaion of vaious tasks which can be easily described using a Gantt chart. The main advantage of this approach is that we can make use of graphical interface to better describe the amount of time needed for each activity, milestones dates and the resources allocated to each activity.