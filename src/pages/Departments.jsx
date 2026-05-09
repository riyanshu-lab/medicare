import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { departments } from '../data/mockData';
import '../styles/departments.css';

const Departments = () => (
  <div className="departments-page page-fade-in">
    <div className="page-header">
      <div className="container">
        <span className="eyebrow">Medical Specialties</span>
        <h1>Our Departments</h1>
        <p>Comprehensive care spanning all major medical disciplines, each led by world-class specialists committed to your health.</p>
      </div>
    </div>
    <div className="container section">
      <div className="depts-grid">
        {departments.map(d => (
          <div key={d.id} className="dept-detail-card card">
            <div className="ddc-icon">{d.icon}</div>
            <h3>{d.name}</h3>
            <p>{d.description}</p>
            <Link to={`/doctors?dept=${d.name}`} className="btn btn-s btn-sm" style={{ alignSelf:'flex-start', marginTop:'auto' }}>
              View Specialists
            </Link>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Departments;
