// src/screens/admin/AdminMiscScreens.js
// Covers: Categories, Menu, Events, Catering, Shipping, Content, Media, Reviews, Customers, Settings

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_FONTS, ADMIN_SPACING } from '../../utils/adminConstants';
import adminApiService from '../../api/adminApiService';
import {
  StatusBadge, AdminButton, AdminInput, AdminSelect, AdminToggle,
  AdminLoading, AdminEmpty, AdminSectionHeader, confirmAction, adminStyles,
} from '../../components/admin/AdminShared';

// ─────────────────────────────────────────────────────────────
// Generic CRUD List Screen
// ─────────────────────────────────────────────────────────────
const CrudListScreen = ({
  title, icon, items, loading, fields, onSave, onDelete, onToggle,
  extra = null, renderItem = null, keyField = 'id',
}) => {
  const [editItem, setEditItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditItem({}); setModalOpen(true); };
  const openEdit = (item) => { setEditItem({ ...item }); setModalOpen(true); };
  const handleSave = async () => {
    setSaving(true);
    try { await onSave(editItem, !editItem[keyField]); setModalOpen(false); }
    catch { Alert.alert('Error', 'Failed to save.'); }
    finally { setSaving(false); }
  };

  if (loading) return <AdminLoading message={`Loading ${title}...`} />;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Ionicons name={icon} size={20} color={ADMIN_COLORS.primary} />
          <Text style={s.title}>{title}</Text>
        </View>
        <AdminButton label="Add New" icon="add-outline" onPress={openCreate} />
      </View>
      {extra}
      <FlatList
        data={items}
        keyExtractor={(item) => item[keyField]?.toString() || Math.random().toString()}
        ListEmptyComponent={<AdminEmpty icon={icon} message={`No ${title} yet`} />}
        renderItem={renderItem ? renderItem : ({ item }) => (
          <View style={s.itemCard}>
            <View style={{ flex: 1 }}>
              {fields.filter(f => f.primary).map(f => (
                <Text key={f.key} style={s.itemPrimary}>{item[f.key]}</Text>
              ))}
              {fields.filter(f => f.secondary).map(f => (
                <Text key={f.key} style={s.itemSecondary}>{f.prefix}{item[f.key]}</Text>
              ))}
            </View>
            <View style={s.itemActions}>
              {onToggle && (
                <TouchableOpacity style={s.actionBtn} onPress={() => onToggle(item)}>
                  <Ionicons name={item.is_active ? 'checkmark-circle' : 'close-circle'} size={18} color={item.is_active ? ADMIN_COLORS.success : ADMIN_COLORS.error} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.actionBtn} onPress={() => openEdit(item)}>
                <Ionicons name="pencil-outline" size={16} color={ADMIN_COLORS.info} />
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn} onPress={() => confirmAction(`Delete`, `Delete this item?`, () => onDelete(item))}>
                <Ionicons name="trash-outline" size={16} color={ADMIN_COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{editItem?.[keyField] ? `Edit ${title}` : `Add ${title}`}</Text>
            <TouchableOpacity onPress={() => setModalOpen(false)}><Ionicons name="close" size={22} color={ADMIN_COLORS.textMuted} /></TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody}>
            {fields.map(f => {
              if (f.type === 'toggle') return (
                <AdminToggle key={f.key} label={f.label} value={!!editItem?.[f.key]} onToggle={v => setEditItem(p => ({ ...p, [f.key]: v }))} />
              );
              if (f.type === 'select') return (
                <AdminSelect key={f.key} label={f.label} value={editItem?.[f.key]} options={f.options || []} onSelect={v => setEditItem(p => ({ ...p, [f.key]: v }))} />
              );
              return (
                <AdminInput key={f.key} label={f.label} value={editItem?.[f.key]?.toString() || ''} onChangeText={v => setEditItem(p => ({ ...p, [f.key]: v }))} multiline={f.multiline} type={f.inputType} required={f.required} placeholder={f.placeholder} />
              );
            })}
            <View style={{ flexDirection: 'row', gap: ADMIN_SPACING.md, marginTop: ADMIN_SPACING.md, paddingBottom: 80 }}>
              <AdminButton label="Cancel" onPress={() => setModalOpen(false)} variant="ghost" style={{ flex: 1 }} />
              <AdminButton label="Save" onPress={handleSave} loading={saving} icon="checkmark-outline" style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────
export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApiService.getCategories().then(r => { setCategories(r?.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (item, isNew) => {
    if (isNew) {
      const res = await adminApiService.createCategory(item);
      setCategories(p => [...p, res?.data]);
    } else {
      await adminApiService.updateCategory(item.category_id, item);
      setCategories(p => p.map(c => c.category_id === item.category_id ? item : c));
    }
  };

  return <CrudListScreen title="Categories" icon="folder-outline" items={categories} loading={loading} keyField="category_id"
    fields={[
      { key: 'category_name', label: 'Category Name', required: true, primary: true },
      { key: 'category_slug', label: 'Slug (URL)', placeholder: 'e.g. paan-products', secondary: true },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'image_url', label: 'Image URL', placeholder: 'https://...' },
      { key: 'display_order', label: 'Display Order', inputType: 'number' },
      { key: 'is_active', label: 'Active', type: 'toggle' },
    ]}
    onSave={handleSave}
    onDelete={async (item) => { await adminApiService.deleteCategory(item.category_id); setCategories(p => p.filter(c => c.category_id !== item.category_id)); }}
  />;
};

// ─────────────────────────────────────────────────────────────
// MENU ITEMS
// ─────────────────────────────────────────────────────────────
export const AdminMenu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApiService.getMenuItems().then(r => { setItems(r?.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return <CrudListScreen title="Menu / Paan Items" icon="restaurant-outline" items={items} loading={loading} keyField="item_id"
    fields={[
      { key: 'item_name', label: 'Item Name', required: true, primary: true },
      { key: 'category_name', label: 'Category', secondary: true },
      { key: 'price', label: 'Price ($)', inputType: 'number', required: true },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'image_url', label: 'Image URL' },
      { key: 'is_available', label: 'Available', type: 'toggle' },
      { key: 'is_featured', label: 'Featured', type: 'toggle' },
      { key: 'display_order', label: 'Display Order', inputType: 'number' },
    ]}
    onSave={async (item, isNew) => {
      if (isNew) { const r = await adminApiService.createMenuItem(item); setItems(p => [...p, r?.data]); }
      else { await adminApiService.updateMenuItem(item.item_id, item); setItems(p => p.map(i => i.item_id === item.item_id ? item : i)); }
    }}
    onDelete={async (item) => { await adminApiService.deleteMenuItem(item.item_id); setItems(p => p.filter(i => i.item_id !== item.item_id)); }}
  />;
};

// ─────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────
export const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApiService.getEvents().then(r => { setEvents(r?.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return <CrudListScreen title="Events" icon="calendar-outline" items={events} loading={loading} keyField="event_id"
    fields={[
      { key: 'event_name', label: 'Event Name', required: true, primary: true },
      { key: 'event_date', label: 'Event Date (YYYY-MM-DD)', required: true, secondary: true, prefix: '📅 ' },
      { key: 'event_time', label: 'Event Time (HH:MM)', placeholder: '18:00' },
      { key: 'end_date', label: 'End Date' },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'location', label: 'Location / Venue' },
      { key: 'address', label: 'Full Address' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'capacity', label: 'Max Capacity', inputType: 'number' },
      { key: 'image_url', label: 'Image URL' },
      { key: 'status', label: 'Status', type: 'select', options: ['upcoming', 'ongoing', 'completed', 'cancelled'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })) },
      { key: 'is_featured', label: 'Featured', type: 'toggle' },
    ]}
    onSave={async (item, isNew) => {
      if (isNew) { const r = await adminApiService.createEvent(item); setEvents(p => [...p, r?.data]); }
      else { await adminApiService.updateEvent(item.event_id, item); setEvents(p => p.map(e => e.event_id === item.event_id ? item : e)); }
    }}
    onDelete={async (item) => { await adminApiService.deleteEvent(item.event_id); setEvents(p => p.filter(e => e.event_id !== item.event_id)); }}
  />;
};

// ─────────────────────────────────────────────────────────────
// CATERING INQUIRIES
// ─────────────────────────────────────────────────────────────
export const AdminCatering = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new');

  useEffect(() => { loadInquiries(); }, [filter]);
  const loadInquiries = async () => {
    try { const r = await adminApiService.getCateringInquiries(filter !== 'all' ? filter : null); setInquiries(r?.data || []); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (id, status) => {
    Alert.prompt('Admin Notes', 'Add notes (optional):', async (notes) => {
      try {
        await adminApiService.updateCateringStatus(id, status, notes);
        setInquiries(p => p.map(i => i.inquiry_id === id ? { ...i, status, admin_notes: notes } : i));
      } catch { Alert.alert('Error', 'Failed to update.'); }
    }, 'plain-text', '');
  };

  if (loading) return <AdminLoading message="Loading Catering Requests..." />;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Catering Inquiries</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: ADMIN_SPACING.md, marginBottom: ADMIN_SPACING.sm }}>
        {['all', 'new', 'in_progress', 'resolved', 'closed'].map(f => (
          <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f.replace('_', ' ').toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={inquiries}
        keyExtractor={i => i.inquiry_id?.toString()}
        ListEmptyComponent={<AdminEmpty icon="people-outline" message="No catering inquiries" />}
        renderItem={({ item }) => (
          <View style={s.cateringCard}>
            <View style={s.cateringCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={s.cateringName}>{item.first_name} {item.last_name}</Text>
                <Text style={s.cateringEmail}>{item.email} • {item.phone}</Text>
                <Text style={s.cateringDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
            <Text style={s.cateringMsg} numberOfLines={3}>{item.message}</Text>
            {item.admin_notes && <View style={s.adminNoteBox}><Text style={s.adminNoteText}>Note: {item.admin_notes}</Text></View>}
            <View style={s.cateringActions}>
              <AdminButton label="In Progress" size="sm" variant="warning" onPress={() => handleUpdate(item.inquiry_id, 'in_progress')} />
              <AdminButton label="Resolved" size="sm" variant="success" onPress={() => handleUpdate(item.inquiry_id, 'resolved')} />
              <AdminButton label="Close" size="sm" variant="ghost" onPress={() => handleUpdate(item.inquiry_id, 'closed')} />
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// SHIPPING
// ─────────────────────────────────────────────────────────────
export const AdminShipping = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    adminApiService.getShippingZones().then(r => { setZones(r?.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const selectZone = async (zone) => {
    setSelectedZone(zone);
    try { const r = await adminApiService.getShippingMethods(zone.zone_id); setMethods(r?.data || []); } catch {}
  };

  if (loading) return <AdminLoading message="Loading Shipping..." />;

  return (
    <View style={s.root}>
      <View style={s.header}><Text style={s.title}>Shipping Zones & Rates</Text></View>
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {/* Zones Panel */}
        <View style={{ width: 160, borderRightWidth: 1, borderRightColor: ADMIN_COLORS.border }}>
          <View style={s.panelHeader}><Text style={s.panelTitle}>Zones</Text></View>
          <FlatList
            data={zones}
            keyExtractor={z => z.zone_id?.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={[s.zoneItem, selectedZone?.zone_id === item.zone_id && s.zoneItemActive]} onPress={() => selectZone(item)}>
                <Text style={[s.zoneLabel, selectedZone?.zone_id === item.zone_id && s.zoneLabelActive]}>{item.zone_name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<AdminEmpty icon="map-outline" message="No zones" />}
          />
        </View>
        {/* Methods Panel */}
        <View style={{ flex: 1 }}>
          <View style={s.panelHeader}>
            <Text style={s.panelTitle}>{selectedZone ? `${selectedZone.zone_name} - Methods` : 'Select a Zone'}</Text>
          </View>
          {selectedZone ? (
            <FlatList
              data={methods}
              keyExtractor={m => m.method_id?.toString()}
              ListEmptyComponent={<AdminEmpty icon="airplane-outline" message="No shipping methods for this zone" />}
              renderItem={({ item }) => (
                <View style={s.methodCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.methodName}>{item.carrier} — {item.service_name}</Text>
                    <Text style={s.methodRate}>Base: ${parseFloat(item.base_rate || 0).toFixed(2)} • {item.min_days}-{item.max_days} days</Text>
                  </View>
                  <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
                </View>
              )}
            />
          ) : (
            <AdminEmpty icon="arrow-back-outline" message="Select a shipping zone from the left panel" />
          )}
        </View>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE CONTENT
// ─────────────────────────────────────────────────────────────
export const AdminContent = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApiService.getContent().then(r => { setContent(r?.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem?.content_id) {
        await adminApiService.updateContent(editItem.content_id, editItem);
        setContent(p => p.map(c => c.content_id === editItem.content_id ? editItem : c));
      } else {
        const r = await adminApiService.createContent(editItem);
        setContent(p => [...p, r?.data]);
      }
      setEditItem(null);
    } finally { setSaving(false); }
  };

  if (loading) return <AdminLoading message="Loading Content..." />;

  const pages = [...new Set(content.map(c => c.page_section).filter(Boolean))];

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Page Content</Text>
        <AdminButton label="Add Content" icon="add-outline" onPress={() => setEditItem({})} />
      </View>
      <ScrollView>
        {pages.map(page => (
          <View key={page} style={s.contentSection}>
            <Text style={s.contentPage}>{page.replace(/_/g, ' ').toUpperCase()}</Text>
            {content.filter(c => c.page_section === page).map(item => (
              <TouchableOpacity key={item.content_id} style={s.contentItem} onPress={() => setEditItem({ ...item })}>
                <View style={{ flex: 1 }}>
                  <Text style={s.contentKey}>{item.content_key}</Text>
                  <Text style={s.contentValue} numberOfLines={2}>{item.content_value || item.image_url}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <View style={s.contentTypeBadge}><Text style={s.contentTypeText}>{item.content_type}</Text></View>
                  <Ionicons name="pencil-outline" size={15} color={ADMIN_COLORS.textDim} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
      {/* Edit Modal */}
      {editItem && (
        <Modal visible animationType="slide" onRequestClose={() => setEditItem(null)}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editItem.content_id ? 'Edit Content' : 'Add Content'}</Text>
              <TouchableOpacity onPress={() => setEditItem(null)}><Ionicons name="close" size={22} color={ADMIN_COLORS.textMuted} /></TouchableOpacity>
            </View>
            <ScrollView style={s.modalBody}>
              <AdminInput label="Content Key" value={editItem.content_key} onChangeText={v => setEditItem(p => ({ ...p, content_key: v }))} required />
              <AdminSelect label="Type" value={editItem.content_type} options={['text', 'html', 'image', 'video'].map(t => ({ value: t, label: t }))} onSelect={v => setEditItem(p => ({ ...p, content_type: v }))} />
              <AdminInput label="Page Section" value={editItem.page_section} onChangeText={v => setEditItem(p => ({ ...p, page_section: v }))} placeholder="home_hero, events, etc." />
              <AdminInput label="Content Value" value={editItem.content_value} onChangeText={v => setEditItem(p => ({ ...p, content_value: v }))} multiline />
              <AdminInput label="Image URL" value={editItem.image_url} onChangeText={v => setEditItem(p => ({ ...p, image_url: v }))} />
              <AdminInput label="Alt Text" value={editItem.alt_text} onChangeText={v => setEditItem(p => ({ ...p, alt_text: v }))} />
              <AdminInput label="Display Order" value={editItem.display_order?.toString()} onChangeText={v => setEditItem(p => ({ ...p, display_order: v }))} type="number" />
              <AdminToggle label="Active" value={!!editItem.is_active} onToggle={v => setEditItem(p => ({ ...p, is_active: v }))} />
              <View style={{ flexDirection: 'row', gap: ADMIN_SPACING.md, marginTop: ADMIN_SPACING.md, paddingBottom: 80 }}>
                <AdminButton label="Cancel" onPress={() => setEditItem(null)} variant="ghost" style={{ flex: 1 }} />
                <AdminButton label="Save Content" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// REVIEWS MODERATION
// ─────────────────────────────────────────────────────────────
export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => { loadReviews(); }, [filter]);
  const loadReviews = async () => {
    try { const r = await adminApiService.getReviews(filter !== 'all' ? filter : null); setReviews(r?.data || []); }
    finally { setLoading(false); }
  };

  const approve = async (id) => { await adminApiService.updateReviewStatus(id, 'approved'); setReviews(p => p.map(r => r.review_id === id ? { ...r, status: 'approved' } : r)); };
  const reject = async (id) => { await adminApiService.updateReviewStatus(id, 'rejected'); setReviews(p => p.map(r => r.review_id === id ? { ...r, status: 'rejected' } : r)); };
  const feature = async (r) => { await adminApiService.toggleReviewFeatured(r.review_id, !r.is_featured); setReviews(p => p.map(rv => rv.review_id === r.review_id ? { ...rv, is_featured: !r.is_featured } : rv)); };
  const del = async (id) => { confirmAction('Delete Review', 'Permanently delete this review?', async () => { await adminApiService.deleteReview(id); setReviews(p => p.filter(r => r.review_id !== id)); }); };

  if (loading) return <AdminLoading message="Loading Reviews..." />;
  return (
    <View style={s.root}>
      <View style={s.header}><Text style={s.title}>Review Moderation</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: ADMIN_SPACING.md, marginBottom: ADMIN_SPACING.sm }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={reviews}
        keyExtractor={r => r.review_id?.toString()}
        ListEmptyComponent={<AdminEmpty icon="star-outline" message="No reviews" />}
        renderItem={({ item }) => (
          <View style={s.reviewCard}>
            <View style={s.reviewTop}>
              <Text style={s.reviewAuthor}>{item.author_name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={s.reviewSource}>{item.source}</Text>
                <StatusBadge status={item.status} />
                {item.is_featured && <View style={s.featuredBadge}><Text style={s.featuredText}>★ Featured</Text></View>}
              </View>
            </View>
            <Text style={s.reviewStars}>{'★'.repeat(Math.round(item.rating))}{'☆'.repeat(5 - Math.round(item.rating))}</Text>
            <Text style={s.reviewText} numberOfLines={4}>{item.review_text}</Text>
            <View style={s.reviewActions}>
              <AdminButton label="Approve" size="sm" variant="success" onPress={() => approve(item.review_id)} />
              <AdminButton label="Reject" size="sm" variant="danger" onPress={() => reject(item.review_id)} />
              <AdminButton label={item.is_featured ? 'Unfeature' : 'Feature'} size="sm" variant="warning" onPress={() => feature(item)} />
              <AdminButton label="Delete" size="sm" variant="ghost" onPress={() => del(item.review_id)} />
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────────────────────
export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { adminApiService.getCustomers().then(r => { setCustomers(r?.data || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const toggle = async (c) => { await adminApiService.toggleCustomerActive(c.customer_id, !c.is_active); setCustomers(p => p.map(cu => cu.customer_id === c.customer_id ? { ...cu, is_active: !c.is_active } : cu)); };
  const filtered = customers.filter(c => !search || `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <AdminLoading message="Loading Customers..." />;
  return (
    <View style={s.root}>
      <View style={s.header}><Text style={s.title}>Customers</Text><Text style={s.subTitle}>{customers.length} total</Text></View>
      <View style={s.searchBar}>
        <Ionicons name="search-outline" size={15} color={ADMIN_COLORS.textDim} />
        <TextInput style={s.searchInput} placeholder="Search..." placeholderTextColor={ADMIN_COLORS.textDim} value={search} onChangeText={setSearch} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={c => c.customer_id?.toString()}
        ListEmptyComponent={<AdminEmpty icon="person-outline" message="No customers" />}
        renderItem={({ item: c }) => (
          <View style={s.customerCard}>
            <View style={s.customerAvatar}><Text style={s.customerAvatarText}>{c.first_name?.[0]}{c.last_name?.[0]}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.customerName}>{c.first_name} {c.last_name}</Text>
              <Text style={s.customerEmail}>{c.email}</Text>
              <Text style={s.customerMeta}>{c.phone} • Joined {new Date(c.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={{ gap: 4, alignItems: 'flex-end' }}>
              <StatusBadge status={c.is_active ? 'active' : 'inactive'} />
              {!c.email_verified && <StatusBadge status="pending" />}
              <TouchableOpacity onPress={() => toggle(c)}><Ionicons name={c.is_active ? 'ban-outline' : 'checkmark-circle-outline'} size={18} color={c.is_active ? ADMIN_COLORS.error : ADMIN_COLORS.success} /></TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────
export const AdminSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => { adminApiService.getSettings().then(r => { setSettings(r?.data || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const updateVal = (key, val) => setSettings(p => p.map(s => s.setting_key === key ? { ...s, setting_value: val } : s));
  const saveSetting = async (key, val) => {
    setSaving(p => ({ ...p, [key]: true }));
    try { await adminApiService.updateSetting(key, val); Alert.alert('Saved', `${key} updated.`); }
    catch { Alert.alert('Error', 'Failed to save.'); }
    finally { setSaving(p => ({ ...p, [key]: false })); }
  };

  const categories = [...new Set(settings.map(s => s.category).filter(Boolean))];
  if (loading) return <AdminLoading message="Loading Settings..." />;

  return (
    <View style={s.root}>
      <View style={s.header}><Text style={s.title}>Site Settings</Text></View>
      <ScrollView>
        {categories.map(cat => (
          <View key={cat} style={s.settingsSection}>
            <Text style={s.settingsCategory}>{cat.toUpperCase()}</Text>
            {settings.filter(st => st.category === cat).map(setting => (
              <View key={setting.setting_key} style={s.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.settingKey}>{setting.setting_key.replace(/_/g, ' ')}</Text>
                  {setting.description && <Text style={s.settingDesc}>{setting.description}</Text>}
                  <TextInput
                    style={s.settingInput}
                    value={setting.setting_value?.toString() || ''}
                    onChangeText={v => updateVal(setting.setting_key, v)}
                    placeholderTextColor={ADMIN_COLORS.textDim}
                    multiline={setting.setting_type === 'json'}
                  />
                </View>
                <AdminButton
                  label={saving[setting.setting_key] ? '...' : 'Save'}
                  size="sm"
                  onPress={() => saveSetting(setting.setting_key, setting.setting_value)}
                  loading={saving[setting.setting_key]}
                  style={{ marginLeft: ADMIN_SPACING.sm, marginTop: ADMIN_SPACING.lg }}
                />
              </View>
            ))}
          </View>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// MEDIA MANAGEMENT (placeholder - needs native image picker)
// ─────────────────────────────────────────────────────────────
export const AdminMedia = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApiService.getMedia().then(r => { setMedia(r?.data || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <AdminLoading message="Loading Media..." />;
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Images & Media</Text>
        <AdminButton label="Upload" icon="cloud-upload-outline" onPress={() => Alert.alert('Coming Soon', 'Use the product edit screen to add image URLs. Native file upload requires expo-image-picker.')} />
      </View>
      {media.length === 0 ? (
        <AdminEmpty icon="images-outline" message="No media files. Add image URLs through product management." />
      ) : (
        <FlatList
          data={media}
          numColumns={3}
          keyExtractor={m => m.id?.toString()}
          renderItem={({ item }) => (
            <View style={s.mediaCard}>
              <Text style={s.mediaUrl} numberOfLines={2}>{item.url}</Text>
              <Text style={s.mediaType}>{item.type}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// SHARED STYLES
// ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: ADMIN_COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: ADMIN_SPACING.lg, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm },
  title: { fontSize: ADMIN_FONTS.xl, fontWeight: '800', color: ADMIN_COLORS.text },
  subTitle: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: ADMIN_SPACING.md, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border, backgroundColor: ADMIN_COLORS.bgCard },
  itemPrimary: { fontSize: ADMIN_FONTS.md, fontWeight: '700', color: ADMIN_COLORS.text },
  itemSecondary: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { width: 30, height: 30, borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: ADMIN_COLORS.bg },
  filterChip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 14, backgroundColor: ADMIN_COLORS.bgCard, marginRight: 6, borderWidth: 1, borderColor: ADMIN_COLORS.border },
  filterChipActive: { backgroundColor: ADMIN_COLORS.primary, borderColor: ADMIN_COLORS.primary },
  filterText: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textMuted, fontWeight: '700' },
  filterTextActive: { color: ADMIN_COLORS.white },
  modal: { flex: 1, backgroundColor: ADMIN_COLORS.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: ADMIN_SPACING.lg, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border, backgroundColor: ADMIN_COLORS.bgCard, paddingTop: ADMIN_SPACING.lg + 40 },
  modalTitle: { fontSize: ADMIN_FONTS.xl, fontWeight: '800', color: ADMIN_COLORS.text },
  modalBody: { flex: 1, padding: ADMIN_SPACING.lg },
  // Catering
  cateringCard: { margin: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bgCard, borderRadius: 10, padding: ADMIN_SPACING.md, borderWidth: 1, borderColor: ADMIN_COLORS.border },
  cateringCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: ADMIN_SPACING.sm },
  cateringName: { fontSize: ADMIN_FONTS.md, fontWeight: '700', color: ADMIN_COLORS.text },
  cateringEmail: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, marginTop: 2 },
  cateringDate: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textDim, marginTop: 2 },
  cateringMsg: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, marginBottom: ADMIN_SPACING.sm },
  adminNoteBox: { backgroundColor: ADMIN_COLORS.secondary + '22', borderRadius: 6, padding: ADMIN_SPACING.sm, marginBottom: ADMIN_SPACING.sm },
  adminNoteText: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.secondary },
  cateringActions: { flexDirection: 'row', gap: ADMIN_SPACING.sm, flexWrap: 'wrap' },
  // Shipping
  panelHeader: { padding: ADMIN_SPACING.md, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border, backgroundColor: ADMIN_COLORS.bgCard },
  panelTitle: { fontSize: ADMIN_FONTS.sm, fontWeight: '700', color: ADMIN_COLORS.text },
  zoneItem: { padding: ADMIN_SPACING.md, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border },
  zoneItemActive: { backgroundColor: ADMIN_COLORS.primary + '22' },
  zoneLabel: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted },
  zoneLabelActive: { color: ADMIN_COLORS.primary, fontWeight: '700' },
  methodCard: { flexDirection: 'row', alignItems: 'center', padding: ADMIN_SPACING.md, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border },
  methodName: { fontSize: ADMIN_FONTS.md, fontWeight: '600', color: ADMIN_COLORS.text },
  methodRate: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, marginTop: 2 },
  // Content
  contentSection: { margin: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bgCard, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: ADMIN_COLORS.border },
  contentPage: { fontSize: ADMIN_FONTS.xs, fontWeight: '800', color: ADMIN_COLORS.secondary, letterSpacing: 1.5, padding: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bg, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border },
  contentItem: { flexDirection: 'row', alignItems: 'center', padding: ADMIN_SPACING.md, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border },
  contentKey: { fontSize: ADMIN_FONTS.sm, fontWeight: '700', color: ADMIN_COLORS.text },
  contentValue: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textMuted, marginTop: 2 },
  contentTypeBadge: { backgroundColor: ADMIN_COLORS.info + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  contentTypeText: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.info, fontWeight: '700' },
  // Reviews
  reviewCard: { margin: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bgCard, borderRadius: 10, padding: ADMIN_SPACING.md, borderWidth: 1, borderColor: ADMIN_COLORS.border },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewAuthor: { fontSize: ADMIN_FONTS.md, fontWeight: '700', color: ADMIN_COLORS.text },
  reviewSource: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textDim, marginRight: 4 },
  reviewStars: { fontSize: ADMIN_FONTS.md, color: ADMIN_COLORS.secondary, marginBottom: 4 },
  reviewText: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, marginBottom: ADMIN_SPACING.sm },
  reviewActions: { flexDirection: 'row', gap: ADMIN_SPACING.sm, flexWrap: 'wrap' },
  featuredBadge: { backgroundColor: ADMIN_COLORS.secondary + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  featuredText: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.secondary, fontWeight: '700' },
  // Customers
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm, margin: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bgCard, borderRadius: 8, paddingHorizontal: ADMIN_SPACING.md, paddingVertical: ADMIN_SPACING.sm, borderWidth: 1, borderColor: ADMIN_COLORS.border },
  searchInput: { flex: 1, color: ADMIN_COLORS.text, fontSize: ADMIN_FONTS.md },
  customerCard: { flexDirection: 'row', alignItems: 'center', gap: ADMIN_SPACING.sm, padding: ADMIN_SPACING.md, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border },
  customerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: ADMIN_COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  customerAvatarText: { color: ADMIN_COLORS.white, fontSize: ADMIN_FONTS.sm, fontWeight: '700' },
  customerName: { fontSize: ADMIN_FONTS.md, fontWeight: '700', color: ADMIN_COLORS.text },
  customerEmail: { fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.textMuted, marginTop: 2 },
  customerMeta: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textDim, marginTop: 2 },
  // Settings
  settingsSection: { margin: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bgCard, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: ADMIN_COLORS.border },
  settingsCategory: { fontSize: ADMIN_FONTS.xs, fontWeight: '800', color: ADMIN_COLORS.secondary, letterSpacing: 2, padding: ADMIN_SPACING.md, backgroundColor: ADMIN_COLORS.bg, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border },
  settingRow: { flexDirection: 'row', alignItems: 'flex-start', padding: ADMIN_SPACING.md, borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.border },
  settingKey: { fontSize: ADMIN_FONTS.sm, fontWeight: '600', color: ADMIN_COLORS.text, textTransform: 'capitalize' },
  settingDesc: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textDim, marginBottom: 4 },
  settingInput: { marginTop: 4, backgroundColor: ADMIN_COLORS.bg, borderWidth: 1, borderColor: ADMIN_COLORS.border, borderRadius: 6, padding: 8, fontSize: ADMIN_FONTS.sm, color: ADMIN_COLORS.text },
  // Media
  mediaCard: { flex: 1, margin: 4, backgroundColor: ADMIN_COLORS.bgCard, borderRadius: 8, padding: ADMIN_SPACING.sm, aspectRatio: 1 },
  mediaUrl: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.textDim },
  mediaType: { fontSize: ADMIN_FONTS.xs, color: ADMIN_COLORS.info, marginTop: 2 },
});
