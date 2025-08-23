"use client";

import React from "react";
import NotusCard, { NotusCardHeader, NotusCardBody } from "../../components/NotusCard";
import NotusButton from "../../components/NotusButton";

export default function TestNotusPage() {
  return (
    <div className="min-h-screen bg-blueGray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blueGray-800 mb-8 text-center">
          Notus Theme Test Page
        </h1>
        
        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <NotusCard>
            <NotusCardHeader>
              <h2 className="text-xl font-semibold text-blueGray-700">Test Card 1</h2>
            </NotusCardHeader>
            <NotusCardBody>
              <p className="text-blueGray-600">This is a test card to verify the Notus theme is working.</p>
            </NotusCardBody>
          </NotusCard>
          
          <NotusCard>
            <NotusCardHeader>
              <h2 className="text-xl font-semibold text-blueGray-700">Test Card 2</h2>
            </NotusCardHeader>
            <NotusCardBody>
              <p className="text-blueGray-600">Another test card to check the styling.</p>
            </NotusCardBody>
          </NotusCard>
        </div>
        
        {/* Test Buttons */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-semibold text-blueGray-700 mb-4">Button Variants</h3>
          <div className="flex flex-wrap gap-4">
            <NotusButton variant="primary">Primary Button</NotusButton>
            <NotusButton variant="secondary">Secondary Button</NotusButton>
            <NotusButton variant="success">Success Button</NotusButton>
            <NotusButton variant="warning">Warning Button</NotusButton>
            <NotusButton variant="danger">Danger Button</NotusButton>
            <NotusButton variant="info">Info Button</NotusButton>
          </div>
        </div>
        
        {/* Test Gradients */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-blueGray-700 mb-4">Gradient Backgrounds</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">Primary Gradient</span>
            </div>
            <div className="h-32 bg-gradient-success rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">Success Gradient</span>
            </div>
            <div className="h-32 bg-gradient-warning rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">Warning Gradient</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





