import { useState, useEffect } from 'react';
import { adminAPI, itemsAPI } from '../utils/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import WeatherMap from '../components/WeatherMap';
import { useForm } from 'react-hook-form';
import Papa from 'papaparse';
import { Plus, Upload, Trash2, Edit, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, statsRes] = await Promise.all([
        itemsAPI.getAll({}),
        adminAPI.getStats()
      ]);
      setItems(itemsRes.data.data.items);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitItem = async (data) => {
    try {
      if (editingItem) {
        await adminAPI.updateItem(editingItem._id, data);
      } else {
        await adminAPI.createItem(data);
      }
      setShowItemModal(false);
      setEditingItem(null);
      reset();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setValue('name', item.name);
    setValue('category', item.category);
    setValue('unit', item.unit);
    setValue('description', item.description);
    setShowItemModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await adminAPI.deleteItem(id);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          // Transform CSV data to match API format
          const prices = results.data
            .filter(row => row.itemName && row.region && row.price)
            .map(row => ({
              itemName: row.itemName,
              region: row.region,
              date: row.date || new Date().toISOString(),
              price: parseFloat(row.price)
            }));

          if (prices.length === 0) {
            alert('No valid data found in CSV');
            return;
          }

          const response = await adminAPI.bulkUploadPrices({ prices });
          setUploadStatus(response.data.data);
          fetchData();
        } catch (error) {
          alert(error.response?.data?.message || 'Failed to upload prices');
        }
      },
      error: (error) => {
        alert('Failed to parse CSV: ' + error.message);
      }
    });
  };

  const renderItemRow = (item, index) => (
    <tr key={index} className="hover:bg-green-50 transition-colors border-b border-green-100">
      <td className="px-6 py-4">
        <div className="font-medium text-green-900">{item.name}</div>
        <div className="text-sm text-green-600">{item.description || 'No description'}</div>
      </td>
      <td className="px-6 py-4 text-green-800 capitalize">{item.category}</td>
      <td className="px-6 py-4 text-green-800">{item.unit}</td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <Layout>
      {/* Professional Admin Header with Green Nature Theme */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white shadow-xl mb-8 -mt-6 -mx-6 px-6 py-8 rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <span className="bg-white bg-opacity-20 p-3 rounded-xl">⚙️</span>
                Admin Dashboard
              </h1>
              <p className="text-green-100 text-lg">System Management & Data Control</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-200">Logged in as</div>
              <div className="text-xl font-semibold">Administrator</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats - Green Nature Theme Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl border-4 border-green-400">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <BarChart3 size={28} />
                </div>
                <div>
                  <div className="text-sm text-green-100">Total Items</div>
                  <div className="text-3xl font-bold">{stats.totals.items}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-xl border-4 border-emerald-400">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <BarChart3 size={28} />
                </div>
                <div>
                  <div className="text-sm text-emerald-100">Price Points</div>
                  <div className="text-3xl font-bold">{stats.totals.pricePoints}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-2xl shadow-xl border-4 border-yellow-400">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <BarChart3 size={28} />
                </div>
                <div>
                  <div className="text-sm text-yellow-100">Total Users</div>
                  <div className="text-3xl font-bold">{stats.totals.users}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-lime-500 to-green-600 text-white p-6 rounded-2xl shadow-xl border-4 border-lime-400">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <BarChart3 size={28} />
                </div>
                <div>
                  <div className="text-sm text-lime-100">Regions</div>
                  <div className="text-3xl font-bold">{stats.pricesByRegion.length}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Map Visualization */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-xl border-4 border-green-200">
          <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <span>🗺️</span>
            Pakistan Weather Map
          </h2>
          <WeatherMap />
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setEditingItem(null);
              reset();
              setShowItemModal(true);
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus size={20} />
            Add Item
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
          >
            <Upload size={20} />
            Upload Prices (CSV)
          </button>
        </div>

        {/* Items Table - Green Nature Theme */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-green-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-green-700">Loading...</p>
            </div>
          ) : (
            <Table
              headers={['Item Details', 'Category', 'Unit', 'Actions']}
              data={items}
              renderRow={renderItemRow}
              emptyMessage="No items yet. Add your first item!"
            />
          )}
        </div>

        {/* Item Modal */}
        <Modal
          isOpen={showItemModal}
          onClose={() => {
            setShowItemModal(false);
            setEditingItem(null);
            reset();
          }}
          title={editingItem ? 'Edit Item' : 'Add New Item'}
        >
          <form onSubmit={handleSubmit(onSubmitItem)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                className="input"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select className="input" {...register('category', { required: 'Category is required' })}>
                <option value="">Select category</option>
                <option value="vegetable">Vegetable</option>
                <option value="fruit">Fruit</option>
                <option value="grain">Grain</option>
                <option value="dairy">Dairy</option>
                <option value="livestock">Livestock</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-danger">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Unit</label>
              <select className="input" {...register('unit', { required: 'Unit is required' })}>
                <option value="">Select unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="lb">Pound (lb)</option>
                <option value="ton">Ton</option>
                <option value="dozen">Dozen</option>
                <option value="liter">Liter</option>
                <option value="piece">Piece</option>
              </select>
              {errors.unit && <p className="mt-1 text-sm text-danger">{errors.unit.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                className="input"
                rows="3"
                {...register('description')}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                  reset();
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        {/* CSV Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setUploadStatus(null);
          }}
          title="Upload Price Data (CSV)"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV file with the following columns: <br />
                <code className="bg-green-100 text-green-800 px-2 py-1 rounded">itemName, region, date, price</code>
              </p>
              
              <div className="bg-green-50 p-4 rounded-lg text-xs mb-4 border-2 border-green-200">
                <p className="font-semibold mb-2 text-green-800">Example CSV:</p>
                <pre className="text-green-700">
itemName,region,date,price{'\n'}
Tomato,Lahore,2025-11-04,45.50{'\n'}
Potato,Karachi,2025-11-04,38.00
                </pre>
              </div>

              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="block w-full text-sm text-gray-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-600 file:text-white
                  hover:file:bg-green-700 file:cursor-pointer"
              />
            </div>

            {uploadStatus && (
              <div className={`p-4 rounded-lg ${
                uploadStatus.failedCount === 0 
                  ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-900' 
                  : 'bg-amber-100 border-2 border-amber-500 text-amber-900'
              }`}>
                <p className="font-semibold mb-2">Upload Result:</p>
                <p>✓ Success: {uploadStatus.successCount}</p>
                <p>✗ Failed: {uploadStatus.failedCount}</p>
                {uploadStatus.failed.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-semibold">View errors</summary>
                    <ul className="mt-2 text-xs space-y-1">
                      {uploadStatus.failed.map((fail, i) => (
                        <li key={i}>{fail.reason}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
