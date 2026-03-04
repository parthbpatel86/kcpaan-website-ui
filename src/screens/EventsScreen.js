// src/screens/EventsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES } from "../utils/constants";
import apiService from "../api/apiService";
import Header, { FloatingButtons } from "../components/Header";
import {
  LoadingSpinner,
  SectionHeader,
  EmptyState,
} from "../components/shared/index";

const TAB = { UPCOMING: "upcoming", PAST: "past", BOOK: "book" };

const EventCard = ({ event, onBook }) => {
  const date = new Date(event.event_date);
  const isUpcoming = event.status === "upcoming" || event.status === "ongoing";

  return (
    <View style={styles.eventCard}>
      {event.image_url && (
        <Image
          source={{ uri: event.image_url }}
          style={styles.eventImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isUpcoming ? COLORS.success : COLORS.textMuted,
              },
            ]}
          />
          <Text style={styles.eventStatus}>{event.status?.toUpperCase()}</Text>
        </View>
        <Text style={styles.eventName}>{event.event_name}</Text>
        <View style={styles.eventMeta}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={COLORS.secondary}
          />
          <Text style={styles.eventMetaText}>
            {date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {event.event_time && ` at ${event.event_time}`}
          </Text>
        </View>
        {event.location && (
          <View style={styles.eventMeta}>
            <Ionicons
              name="location-outline"
              size={14}
              color={COLORS.secondary}
            />
            <Text style={styles.eventMetaText}>{event.location}</Text>
          </View>
        )}
        {event.description && (
          <Text style={styles.eventDescription} numberOfLines={3}>
            {event.description}
          </Text>
        )}
        {event.capacity && (
          <Text style={styles.capacityText}>
            Capacity: {event.registered_count || 0}/{event.capacity} registered
          </Text>
        )}
        {isUpcoming && (
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => onBook(event)}
          >
            <Text style={styles.bookBtnText}>Book / Inquire</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const BookingForm = ({ selectedEvent, onSuccess }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    eventName: selectedEvent?.event_name || "",
    guestCount: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.phone) {
      Alert.alert(
        "Required Fields",
        "Please fill in first name, email, and phone.",
      );
      return;
    }
    setSubmitting(true);
    try {
      await apiService.bookEvent({
        ...form,
        message: `Guests: ${form.guestCount}. ${form.message}`,
      });
      Alert.alert(
        "Booking Submitted!",
        "We'll contact you shortly to confirm your booking.",
        [{ text: "OK", onPress: onSuccess }],
      );
    } catch {
      Alert.alert(
        "Error",
        "Failed to submit booking. Please try again or call us directly.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, field, ...props }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[field]}
        onChangeText={(v) => setForm((p) => ({ ...p, [field]: v }))}
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />
    </View>
  );

  return (
    <ScrollView style={styles.bookingForm} showsVerticalScrollIndicator={false}>
      <SectionHeader label="EVENT BOOKING" title="Book or Inquire" />

      {selectedEvent && (
        <View style={styles.selectedEventBanner}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={COLORS.secondary}
          />
          <Text style={styles.selectedEventText}>
            {selectedEvent.event_name}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Field
            label="First Name *"
            field="firstName"
            placeholder="First Name"
          />
        </View>
        <View style={{ width: SPACING.md }} />
        <View style={{ flex: 1 }}>
          <Field label="Last Name" field="lastName" placeholder="Last Name" />
        </View>
      </View>

      <Field
        label="Email *"
        field="email"
        placeholder="your@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Field
        label="Phone *"
        field="phone"
        placeholder="(816) 000-0000"
        keyboardType="phone-pad"
      />
      <Field label="Event Name" field="eventName" placeholder="Which event?" />
      <Field
        label="Number of Guests"
        field="guestCount"
        placeholder="How many guests?"
        keyboardType="numeric"
      />

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Additional Message</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          value={form.message}
          onChangeText={(v) => setForm((p) => ({ ...p, message: v }))}
          placeholder="Any special requests or questions..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitBtnText}>
          {submitting ? "Submitting..." : "Submit Booking Request"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const EventsScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState(TAB.UPCOMING);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(
    route.params?.event || null,
  );

  useEffect(() => {
    loadEvents();
    if (route.params?.event) setActiveTab(TAB.BOOK);
  }, []);

  const loadEvents = async () => {
    try {
      const [upcoming, past] = await Promise.allSettled([
        apiService.getUpcomingEvents(),
        apiService.getPastEvents(),
      ]);
      if (upcoming.status === "fulfilled")
        setUpcomingEvents(upcoming.value?.data || []);
      if (past.status === "fulfilled") setPastEvents(past.value?.data || []);
    } catch (e) {
      console.error("Events error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (event) => {
    setSelectedEvent(event);
    setActiveTab(TAB.BOOK);
  };

  if (loading) return <LoadingSpinner message="Loading Events..." />;

  return (
    <View style={styles.root}>
      <Header navigation={navigation} title="Events" showBack />

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: TAB.UPCOMING, label: "Upcoming" },
          { key: TAB.PAST, label: "Past Events" },
          { key: TAB.BOOK, label: "Book" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === TAB.UPCOMING && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {upcomingEvents.length === 0 ? (
              <EmptyState
                icon="calendar-outline"
                title="No Upcoming Events"
                message="Check back soon for new events!"
              />
            ) : (
              upcomingEvents.map((event, i) => (
                <EventCard key={i} event={event} onBook={handleBook} />
              ))
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {activeTab === TAB.PAST && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {pastEvents.length === 0 ? (
              <EmptyState
                icon="images-outline"
                title="No Past Events"
                message="Our event history will appear here."
              />
            ) : (
              pastEvents.map((event, i) => (
                <EventCard key={i} event={event} onBook={handleBook} />
              ))
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {activeTab === TAB.BOOK && (
        <View style={styles.scroll}>
          <BookingForm
            selectedEvent={selectedEvent}
            onSuccess={() => setActiveTab(TAB.UPCOMING)}
          />
        </View>
      )}

      <FloatingButtons />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    // WEB SCROLL FIX: bound height to viewport so ScrollView has a finite
    // container to scroll within (mirrors what the OS does on mobile)
    ...(Platform.OS === "web" && { height: "100vh", overflow: "hidden" }),
  },
  scroll: { flex: 1 },
  content: { padding: SPACING.md },
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  tabTextActive: { color: COLORS.primary },
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  eventImage: { width: "100%", height: 180 },
  eventContent: { padding: SPACING.lg },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: SPACING.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  eventStatus: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  eventName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: SPACING.sm,
  },
  eventMeta: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "flex-start",
    marginBottom: 4,
  },
  eventMetaText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, flex: 1 },
  eventDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginTop: SPACING.sm,
  },
  capacityText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignSelf: "flex-start",
    marginTop: SPACING.md,
  },
  bookBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bookingForm: { flex: 1, padding: SPACING.md },
  selectedEventBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 4,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  selectedEventText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  row: { flexDirection: "row" },
  field: { marginBottom: SPACING.md },
  fieldLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.textMedium,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    letterSpacing: 1,
  },
});

export default EventsScreen;
