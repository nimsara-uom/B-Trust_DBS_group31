DROP TABLE IF EXISTS FDPLAN;
CREATE TABLE FDPLAN (
    fd_plan_id      INT AUTO_INCREMENT PRIMARY KEY,  
    term_months     INT NOT NULL,                   
    interest_rate   DECIMAL(5,2) NOT NULL          
);
