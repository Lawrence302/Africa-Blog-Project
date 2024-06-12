-- This file contains the sql schem for the various tables needed for the project
show databases;
create database blogDB;
use blogDB;

-- creating a blog post table

CREATE TABLE blog_post (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    slug VARCHAR(255),
    summary TEXT,
    content TEXT,
    views INT,
    author_id INT,
    category_id INT,
    featured BOOLEAN,
    image_url VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- creating authors table

CREATE TABLE author (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    bio TEXT,
    password VARCHAR(255),
    gender ENUM('male', 'female', 'other'),
    phone VARCHAR(20)
);

-- creating category table

CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- inserting values into the categories table

INSERT INTO category (name, description) VALUES
('dance', 'Articles related to various forms of dance and dance culture.'),
('culture', 'Articles discussing different cultural aspects and practices.'),
('music', 'Articles covering different genres of music and music-related topics.'),
('climate', 'Articles focusing on climate change, environmental issues, and sustainability.'),
('love', 'Articles exploring themes of love, relationships, and emotions.');
