import { useState, useEffect } from 'react';
import { adminAPI, itemsAPI } from '../utils/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
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
    <tr key={index} className="hover:bg-background transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-text">{item.name}</div>
        <div className="text-sm text-muted">{item.description || 'No description'}</div>
      </td>
      <td className="px-6 py-4 text-muted capitalize">{item.category}</td>
      <td className="px-6 py-4 text-muted">{item.unit}</td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-primary hover:bg-background rounded transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            className="p-2 text-danger hover:bg-background rounded transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted">Manage items and price data</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary bg-opacity-20 rounded-lg">
                  <BarChart3 className="text-primary" size={24} />
                </div>
                <div>
                  <div className="text-sm text-muted">Total Items</div>
                  <div className="text-2xl font-bold">{stats.totals.items}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success bg-opacity-20 rounded-lg">
                  <BarChart3 className="text-success" size={24} />
                </div>
                <div>
                  <div className="text-sm text-muted">Price Points</div>
                  <div className="text-2xl font-bold">{stats.totals.pricePoints}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning bg-opacity-20 rounded-lg">
                  <BarChart3 className="text-warning" size={24} />
                </div>
                <div>
                  <div className="text-sm text-muted">Total Users</div>
                  <div className="text-2xl font-bold">{stats.totals.users}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary bg-opacity-20 rounded-lg">
                  <BarChart3 className="text-primary" size={24} />
                </div>
                <div>
                  <div className="text-sm text-muted">Regions</div>
                  <div className="text-2xl font-bold">{stats.pricesByRegion.length}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Button
            variant="primary"
            onClick={() => {
              setEditingItem(null);
              reset();
              setShowItemModal(true);
            }}
          >
            <Plus size={20} className="inline mr-2" />
            Add Item
          </Button>
          <Button
            variant="success"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={20} className="inline mr-2" />
            Upload Prices (CSV)
          </Button>
        </div>

        {/* Items Table */}
        <Card>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted">Loading...</p>
            </div>
          ) : (
            <Table
              headers={['Item Details', 'Category', 'Unit', 'Actions']}
              data={items}
              renderRow={renderItemRow}
              emptyMessage="No items yet. Add your first item!"
            />
          )}
        </Card>

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
          <form onSubmit={handleSubmit(onSubmmitItem)} className="space-y-4">
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
              <Button type="submit" variant="primary" fullWidth>
                {editingItem ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                  reset();
                }}
              >
                Cancel
              </Button>
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
              <p className="text-sm text-muted mb-4">
                Upload a CSV file with the following columns: <br />
                <code className="text-primary">itemName, region, date, price</code>
              </p>
              
              <div className="bg-background p-4 rounded-lg text-xs mb-4">
                <p className="font-semibold mb-2">Example CSV:</p>
                <pre className="text-muted">
itemName,region,date,price{'\n'}
Tomato,Lahore,2025-11-04,45.50{'\n'}
Potato,Karachi,2025-11-04,38.00
                </pre>
              </div>

              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="block w-full text-sm text-muted
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-blue-500 file:cursor-pointer"
              />
            </div>

            {uploadStatus && (
              <div className={`p-4 rounded-lg ${
                uploadStatus.failedCount === 0 
                  ? 'bg-success bg-opacity-20 border border-success' 
                  : 'bg-warning bg-opacity-20 border border-warning'
              }`}>
                <p className="font-semibold mb-2">Upload Result:</p>
                <p>✓ Success: {uploadStatus.successCount}</p>
                <p>✗ Failed: {uploadStatus.failedCount}</p>
                {uploadStatus.failed.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">View errors</summary>
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
