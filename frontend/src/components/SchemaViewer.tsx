import React, { useState, useEffect } from 'react';
import { Cpu, Plus, Save, Trash2, Download, AlertTriangle, Settings, Layers, Code } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './ToastNotification';

export const SchemaViewer: React.FC = () => {
  const [schemas, setSchemas] = useState<any[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'FIELDS' | 'RULES' | 'THRESHOLDS' | 'JSON'>('FIELDS');
  const [saving, setSaving] = useState(false);

  // New Field Form State
  const [showAddField, setShowAddField] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('string');
  const [newRequired, setNewRequired] = useState(false);
  const [newRegex, setNewRegex] = useState('');

  // Confidence Thresholds
  const [highThreshold, setHighThreshold] = useState(85);
  const [mediumThreshold, setMediumThreshold] = useState(60);

  // New Schema Modal
  const [showNewSchemaModal, setShowNewSchemaModal] = useState(false);
  const [newDocType, setNewDocType] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');

  const { addToast } = useToast();

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    try {
      const res = await api.getSchemas();
      setSchemas(res);
      if (res.length > 0 && !selectedSchema) {
        setSelectedSchema(res[0]);
      } else if (selectedSchema) {
        const found = res.find((s: any) => s.document_type === selectedSchema.document_type);
        if (found) setSelectedSchema(found);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddField = () => {
    if (!newKey.trim() || !newLabel.trim()) {
      addToast({ type: 'warning', title: 'Validation', message: 'Field key and label are required.' });
      return;
    }

    const updatedFields = [
      ...(selectedSchema.fields || []),
      {
        key: newKey.trim().toLowerCase().replace(/\s+/g, '_'),
        label: newLabel.trim(),
        type: newType,
        required: newRequired,
        validation_regex: newRegex.trim() || undefined
      }
    ];

    setSelectedSchema({ ...selectedSchema, fields: updatedFields });
    setNewKey('');
    setNewLabel('');
    setNewType('string');
    setNewRequired(false);
    setNewRegex('');
    setShowAddField(false);

    addToast({ type: 'info', title: 'Field Added', message: `Added field '${newLabel}' to draft schema.` });
  };

  const handleDeleteField = (keyToDelete: string) => {
    const updatedFields = (selectedSchema.fields || []).filter((f: any) => f.key !== keyToDelete);
    setSelectedSchema({ ...selectedSchema, fields: updatedFields });
  };

  const handleSaveSchema = async () => {
    if (!selectedSchema) return;
    setSaving(true);
    try {
      await api.saveSchema(selectedSchema);
      await loadSchemas();
      addToast({
        type: 'success',
        title: 'Schema Persisted',
        message: `Schema '${selectedSchema.display_name}' saved successfully.`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not save schema configuration.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewSchema = async () => {
    if (!newDocType.trim() || !newDisplayName.trim()) return;
    const formattedType = newDocType.trim().toLowerCase().replace(/\s+/g, '_');
    const newSchemaObj = {
      document_type: formattedType,
      display_name: newDisplayName.trim(),
      fields: [
        { key: 'title', label: 'Document Title', type: 'string', required: true },
        { key: 'date', label: 'Document Date', type: 'date', required: true }
      ],
      cross_field_rules: []
    };

    try {
      await api.saveSchema(newSchemaObj);
      setShowNewSchemaModal(false);
      setNewDocType('');
      setNewDisplayName('');
      await loadSchemas();
      setSelectedSchema(newSchemaObj);
      addToast({
        type: 'success',
        title: 'New Schema Created',
        message: `Custom schema '${newDisplayName}' is now active.`
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Creation Failed', message: err.message });
    }
  };

  const exportSchemaJson = () => {
    if (!selectedSchema) return;
    const blob = new Blob([JSON.stringify(selectedSchema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSchema.document_type}_schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
      {/* Create New Schema Modal */}
      {showNewSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600 dark:text-teal-400" /> Create Custom Document Schema
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define a new structured extraction target for custom enterprise document formats.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Display Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Purchase Order, Medical Bill"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-teal-400"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Internal Type Key:</label>
                <input
                  type="text"
                  placeholder="e.g. purchase_order, medical_bill"
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 dark:focus:border-teal-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowNewSchemaModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewSchema}
                className="px-4 py-2 rounded-xl bg-indigo-600 dark:bg-teal-600 text-white hover:bg-indigo-700 dark:hover:bg-teal-500 text-xs font-bold transition-all shadow-xs"
              >
                Create Schema
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600 dark:text-teal-400" /> Schema Configuration & Rule Builder
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define extraction contracts, validation regexes, cross-field arithmetic checks & confidence thresholds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewSchemaModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500 dark:hover:border-teal-400 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-teal-400" /> New Schema
          </button>

          <button
            onClick={exportSchemaJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Download Schema JSON"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>

          <button
            onClick={handleSaveSchema}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 dark:bg-teal-600 hover:bg-indigo-700 dark:hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Schema Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {schemas.map((s) => (
          <button
            key={s.document_type}
            onClick={() => setSelectedSchema(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedSchema?.document_type === s.document_type
                ? 'bg-indigo-600 dark:bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            {s.display_name}
          </button>
        ))}
      </div>

      {selectedSchema && (
        <div className="space-y-4">
          {/* Sub-Navigation: Fields vs Cross-Field Rules vs Confidence Thresholds vs Raw JSON */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('FIELDS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'FIELDS' ? 'bg-indigo-50 dark:bg-teal-500/10 text-indigo-700 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Schema Fields ({selectedSchema.fields?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('RULES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'RULES' ? 'bg-indigo-50 dark:bg-teal-500/10 text-indigo-700 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Cross-Field Math Rules
            </button>

            <button
              onClick={() => setActiveTab('THRESHOLDS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'THRESHOLDS' ? 'bg-indigo-50 dark:bg-teal-500/10 text-indigo-700 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Confidence Thresholds
            </button>

            <button
              onClick={() => setActiveTab('JSON')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'JSON' ? 'bg-indigo-50 dark:bg-teal-500/10 text-indigo-700 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Raw JSON Schema
            </button>
          </div>

          {/* TAB 1: Schema Fields List & Add Field */}
          {activeTab === 'FIELDS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Extraction targets for category: <strong className="text-slate-900 dark:text-white">{selectedSchema.display_name}</strong>
                </span>

                <button
                  onClick={() => setShowAddField(!showAddField)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-teal-500/10 text-indigo-700 dark:text-teal-400 text-xs font-bold hover:bg-indigo-600 hover:text-white dark:hover:bg-teal-600 dark:hover:text-white transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> {showAddField ? 'Cancel' : 'Add Field'}
                </button>
              </div>

              {/* Add Field Inline Card */}
              {showAddField && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add New Extraction Field</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Field Label:</label>
                      <input
                        type="text"
                        placeholder="e.g. Tax Amount"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Field Key (JSON):</label>
                      <input
                        type="text"
                        placeholder="e.g. tax_amount"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 dark:focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Data Type:</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-teal-400"
                      >
                        <option value="string">String (Text)</option>
                        <option value="currency">Currency (Amount)</option>
                        <option value="date">Date (ISO 8601)</option>
                        <option value="email">Email Address</option>
                        <option value="phone">Phone Number</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="req-check"
                        checked={newRequired}
                        onChange={(e) => setNewRequired(e.target.checked)}
                        className="rounded accent-indigo-600 dark:accent-teal-500"
                      />
                      <label htmlFor="req-check" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                        Required Field
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Validation Regex (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                      value={newRegex}
                      onChange={(e) => setNewRegex(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-teal-400"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleAddField}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 dark:bg-teal-600 text-white font-bold text-xs hover:bg-indigo-700 dark:hover:bg-teal-500 transition-colors shadow-xs"
                    >
                      Append to Schema
                    </button>
                  </div>
                </div>
              )}

              {/* Fields Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Field Key</th>
                      <th className="py-2.5 px-3">Label</th>
                      <th className="py-2.5 px-3">Data Type</th>
                      <th className="py-2.5 px-3">Requirement</th>
                      <th className="py-2.5 px-3">Validation Rule</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {(selectedSchema.fields || []).map((f: any) => (
                      <tr key={f.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600 dark:text-teal-400">{f.key}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{f.label}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            {f.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {f.required ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              REQUIRED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              OPTIONAL
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {f.validation_regex ? (
                            <span className="truncate max-w-xs block" title={f.validation_regex}>
                              Regex: {f.validation_regex}
                            </span>
                          ) : (
                            <span>Standard {f.type} format</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteField(f.key)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Cross-Field Rules */}
          {activeTab === 'RULES' && (
            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-indigo-600 dark:text-teal-400" /> Cross-Field Integrity Rules
              </h4>
              <p className="text-slate-500 dark:text-slate-400">
                Enforce mathematical or logical constraints across multiple extracted document fields.
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Invoice Arithmetic Verification:</span>
                    <p className="font-mono text-indigo-600 dark:text-teal-400 text-[11px] mt-0.5">
                      subtotal + tax_amount == total_amount (Tolerance: ±0.05)
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[10px]">
                    ACTIVE RULE
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Temporal Logical Constraint:</span>
                    <p className="font-mono text-indigo-600 dark:text-teal-400 text-[11px] mt-0.5">
                      issue_date &lt;= expiry_date (When expiry date provided)
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[10px]">
                    ACTIVE RULE
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Confidence Thresholds */}
          {activeTab === 'THRESHOLDS' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600 dark:text-teal-400" /> OCR & Semantic Confidence Signal Thresholds
              </h4>
              <p className="text-slate-500 dark:text-slate-400">
                Calibrate how extraction confidence scores route documents into auto-approval or human review.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">High Confidence</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px]">
                      &gt; {highThreshold}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Automatically accepted without mandatory manual verification.
                  </p>
                  <input
                    type="range"
                    min="70"
                    max="95"
                    value={highThreshold}
                    onChange={(e) => setHighThreshold(Number(e.target.value))}
                    className="w-full accent-emerald-600 dark:accent-emerald-400"
                  />
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 dark:text-amber-400">Medium Confidence</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-mono font-bold text-[10px]">
                      {mediumThreshold}% - {highThreshold}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Flagged with amber badge for optional reviewer spot-check.
                  </p>
                  <input
                    type="range"
                    min="40"
                    max="80"
                    value={mediumThreshold}
                    onChange={(e) => setMediumThreshold(Number(e.target.value))}
                    className="w-full accent-amber-500 dark:accent-amber-400"
                  />
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-700 dark:text-rose-400">Low Confidence</span>
                    <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-mono font-bold text-[10px]">
                      &lt; {mediumThreshold}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mandatory reviewer review required; document marked REQUIRES_REVIEW.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Raw JSON Schema View */}
          {activeTab === 'JSON' && (
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  JSON Schema Contract: {selectedSchema.document_type}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedSchema, null, 2));
                    addToast({ type: 'success', title: 'Copied', message: 'Schema JSON copied to clipboard.' });
                  }}
                  className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-teal-400 shadow-xs"
                >
                  Copy JSON
                </button>
              </div>

              <pre className="bg-white dark:bg-slate-900 p-4 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto border border-slate-200 dark:border-slate-800 max-h-96 shadow-inner">
                {JSON.stringify(selectedSchema, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
