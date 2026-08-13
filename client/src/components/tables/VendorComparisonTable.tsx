import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone, Mail, TrendingUp, Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

const VendorComparisonTable = () => {
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [vendorList, setVendorList] = useState([]);
  const [viewProfileVendor, setViewProfileVendor] = useState(null);
  const [requestQuoteVendor, setRequestQuoteVendor] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/vendors`, { headers })
      .then(res => setVendorList(res.data))
      .catch(() => {});
  }, []);

  const toggleVendorSelection = (vendorId: number) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleExport = () => {
    const exportData = (selectedVendors.length > 0
      ? vendorList.filter(v => selectedVendors.includes(v.id))
      : vendorList
    ).map(v => ({
      Name: v.name,
      Category: v.category,
      Rating: v.rating,
      Location: v.location,
      Contact: v.contact,
      Email: v.email,
      DeliveryTime: v.deliveryTime,
      PaymentTerms: v.paymentTerms,
      Certification: v.certification,
      PastProjects: v.pastProjects,
      Reliability: v.reliability,
      CostRating: v.costRating,
      QualityRating: v.qualityRating,
      ServiceRating: v.serviceRating
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendors");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "vendor-comparison.xlsx");
  };

  const handleAddVendor = (vendor) => {
    setVendorList(prev => [
      { ...vendor, id: prev.length ? Math.max(...prev.map(v => v.id)) + 1 : 1 },
      ...prev
    ]);
    setShowAddModal(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Enhanced AddVendorModal, ViewProfileModal, and RequestQuoteModal
  const AddVendorModal = ({ onClose, onAdd }) => {
    const [form, setForm] = useState({
      name: '',
      category: '',
      location: '',
      contact: '',
      email: '',
      deliveryTime: '',
      paymentTerms: '',
      certification: '',
      pastProjects: '',
      reliability: '',
      costRating: '',
      qualityRating: '',
      serviceRating: ''
    });
    const cost = parseFloat(form.costRating) || 0;
    const quality = parseFloat(form.qualityRating) || 0;
    const service = parseFloat(form.serviceRating) || 0;
    const overall = ((cost + quality + service) / 3).toFixed(2);
    const isValid =
      form.name && form.category && form.contact && form.email &&
      form.location && form.deliveryTime && form.paymentTerms &&
      form.certification && form.pastProjects && form.reliability &&
      form.costRating && form.qualityRating && form.serviceRating;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Vendor</h2>
              <p className="text-sm text-gray-600">Register a new vendor for comparison and selection</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input className="border p-2 rounded w-full" placeholder="Vendor Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <input className="border p-2 rounded w-full" placeholder="Category" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input className="border p-2 rounded w-full" placeholder="Location" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                    <input className="border p-2 rounded w-full" placeholder="Contact Number" value={form.contact} onChange={e => setForm(f => ({...f, contact: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input className="border p-2 rounded w-full" placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time *</label>
                    <input className="border p-2 rounded w-full" placeholder="e.g. 3-5 days" value={form.deliveryTime} onChange={e => setForm(f => ({...f, deliveryTime: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms *</label>
                    <input className="border p-2 rounded w-full" placeholder="e.g. 30 days" value={form.paymentTerms} onChange={e => setForm(f => ({...f, paymentTerms: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certification *</label>
                    <input className="border p-2 rounded w-full" placeholder="e.g. ISO 9001:2015" value={form.certification} onChange={e => setForm(f => ({...f, certification: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Past Projects *</label>
                    <input className="border p-2 rounded w-full" type="number" min="0" placeholder="Number of Projects" value={form.pastProjects} onChange={e => setForm(f => ({...f, pastProjects: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reliability (%) *</label>
                    <input className="border p-2 rounded w-full" type="number" min="0" max="100" placeholder="Reliability" value={form.reliability} onChange={e => setForm(f => ({...f, reliability: e.target.value}))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Rating (0-5) *</label>
                    <input className="border p-2 rounded w-full" type="number" min="0" max="5" step="0.1" placeholder="Cost Rating" value={form.costRating} onChange={e => setForm(f => ({...f, costRating: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quality Rating (0-5) *</label>
                    <input className="border p-2 rounded w-full" type="number" min="0" max="5" step="0.1" placeholder="Quality Rating" value={form.qualityRating} onChange={e => setForm(f => ({...f, qualityRating: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Rating (0-5) *</label>
                    <input className="border p-2 rounded w-full" type="number" min="0" max="5" step="0.1" placeholder="Service Rating" value={form.serviceRating} onChange={e => setForm(f => ({...f, serviceRating: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating (auto)</label>
                    <input className="border p-2 rounded w-full bg-gray-100" value={overall} readOnly tabIndex={-1} />
                    <span className="text-xs text-gray-500">Average of cost, quality, and service ratings</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button disabled={!isValid} onClick={() => isValid && onAdd({
                ...form,
                rating: +overall,
                pastProjects: +form.pastProjects,
                reliability: +form.reliability,
                costRating: +form.costRating,
                qualityRating: +form.qualityRating,
                serviceRating: +form.serviceRating
              })}>Add Vendor</Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // View Profile Modal
  const ViewProfileModal = ({ vendor, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-2">{vendor.name}</h2>
        <div className="mb-2 text-gray-600">{vendor.category} | {vendor.certification}</div>
        <div className="mb-2"><b>Location:</b> {vendor.location}</div>
        <div className="mb-2"><b>Contact:</b> {vendor.contact} | <b>Email:</b> {vendor.email}</div>
        <div className="mb-2"><b>Delivery Time:</b> {vendor.deliveryTime} | <b>Payment Terms:</b> {vendor.paymentTerms}</div>
        <div className="mb-2"><b>Past Projects:</b> {vendor.pastProjects} | <b>Reliability:</b> {vendor.reliability}%</div>
        <div className="mb-2"><b>Overall Rating:</b> {vendor.rating}/5</div>
        <div className="mb-2"><b>Cost Rating:</b> {vendor.costRating}/5 | <b>Quality Rating:</b> {vendor.qualityRating}/5 | <b>Service Rating:</b> {vendor.serviceRating}/5</div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );

  // Request Quote Modal
  const RequestQuoteModal = ({ vendor, onClose }) => {
    const [form, setForm] = useState({
      subject: '',
      message: ''
    });
    const isValid = form.subject && form.message;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
          <h2 className="text-xl font-bold mb-2">Request Quote from {vendor.name}</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input className="border p-2 rounded w-full" placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Message *</label>
            <textarea className="border p-2 rounded w-full" rows={4} placeholder="Message" value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={!isValid} onClick={onClose}>Send Request</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Vendor Comparison & Selection</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                Export Comparison
              </Button>
              <Button size="sm" onClick={() => setShowAddModal(true)}>
                Add New Vendor
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Vendor Cards */}
      <div className="space-y-4">
        {vendorList.map((vendor) => (
          <Card 
            key={vendor.id} 
            className={`transition-all duration-200 ${
              selectedVendors.includes(vendor.id) 
                ? 'ring-2 ring-green-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(vendor.id)}
                    onChange={() => toggleVendorSelection(vendor.id)}
                    className="mt-1 rounded"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                    <div className="flex items-center mt-1">
                      {renderStars(vendor.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        {vendor.rating} ({vendor.pastProjects} projects)
                      </span>
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {vendor.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800">
                    {vendor.certification}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    {vendor.reliability}% Reliability
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{vendor.location}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{vendor.contact}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{vendor.email}</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Delivery: {vendor.deliveryTime}</span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Cost Rating</p>
                  <div className="flex justify-center">{renderStars(vendor.costRating)}</div>
                  <p className="text-xs font-semibold mt-1">{vendor.costRating}/5</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Quality Rating</p>
                  <div className="flex justify-center">{renderStars(vendor.qualityRating)}</div>
                  <p className="text-xs font-semibold mt-1">{vendor.qualityRating}/5</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Service Rating</p>
                  <div className="flex justify-center">{renderStars(vendor.serviceRating)}</div>
                  <p className="text-xs font-semibold mt-1">{vendor.serviceRating}/5</p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                  <Badge variant="outline">
                    Payment: {vendor.paymentTerms}
                  </Badge>
                  <Badge variant="outline">
                    {vendor.pastProjects} Projects
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setViewProfileVendor(vendor)}>
                    View Profile
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setRequestQuoteVendor(vendor)}>
                    Request Quote
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Summary */}
      {selectedVendors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Selected Vendors Summary ({selectedVendors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedVendors.map(vendorId => {
                const vendor = vendorList.find(v => v.id === vendorId);
                if (!vendor) return null;
                
                return (
                  <div key={vendorId} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900">{vendor.name}</h4>
                    <p className="text-sm text-gray-600">{vendor.category}</p>
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">Overall Score</p>
                      <p className="text-lg font-bold text-green-600">
                        {((vendor.costRating + vendor.qualityRating + vendor.serviceRating) / 3).toFixed(1)}/5
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <Button className="bg-green-600 hover:bg-green-700">
                Proceed with Selected Vendors
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddModal && (
        <div className="top-0">
          <AddVendorModal onClose={() => setShowAddModal(false)} onAdd={handleAddVendor} />
        </div>
      )}
      {viewProfileVendor && <ViewProfileModal vendor={viewProfileVendor} onClose={() => setViewProfileVendor(null)} />}
      {requestQuoteVendor && <RequestQuoteModal vendor={requestQuoteVendor} onClose={() => setRequestQuoteVendor(null)} />}
    </div>
  );
};

export default VendorComparisonTable;