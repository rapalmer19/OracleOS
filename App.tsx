import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type SectionKey = 'user' | 'admin' | 'account';
type ReadingStatus = 'Queue' | 'Reading' | 'Done';

type Section = {
  key: SectionKey;
  glyph: string;
  label: string;
  title: string;
  subtitle: string;
  accent: string;
  background: string;
};

type QueueItem = {
  id: string;
  name: string;
  handle: string;
  reading: string;
  status: ReadingStatus;
};

const sections: Section[] = [
  {
    key: 'user',
    glyph: '🔮',
    label: 'User',
    title: 'Find Your Reader',
    subtitle: 'Search Ryan, buy a reading, and watch your place in the live queue.',
    accent: '#a78bfa',
    background: '#090617',
  },
  {
    key: 'admin',
    glyph: '☿',
    label: 'Admin',
    title: 'Queue Command',
    subtitle: 'Open slots, move people through Queue → Reading → Done, and keep the room clean.',
    accent: '#67e8f9',
    background: '#031116',
  },
  {
    key: 'account',
    glyph: '♙',
    label: 'Account',
    title: 'Client Account',
    subtitle: 'Login, profile details, TikTok handle, and Stripe-saved payment method.',
    accent: '#fbbf24',
    background: '#151006',
  },
];

const queue: QueueItem[] = [
  { id: '1', name: 'Maya L.', handle: '@moonmirror', reading: 'Mini Read', status: 'Queue' },
  { id: '2', name: 'Dre C.', handle: '@drevisions', reading: 'Deep Read', status: 'Reading' },
  { id: '3', name: 'Sofia R.', handle: '@softoracle', reading: 'Mini Read', status: 'Done' },
];

const statusColors: Record<ReadingStatus, string> = {
  Queue: '#a78bfa',
  Reading: '#67e8f9',
  Done: '#86efac',
};

export default function App() {
  const [activeKey, setActiveKey] = useState<SectionKey>('user');
  const active = useMemo(() => sections.find((section) => section.key === activeKey) ?? sections[0], [activeKey]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: active.background }]}>
      <StatusBar style="light" />
      <View style={styles.shell}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brand}>ORACLEOS</Text>
            <Text style={styles.modeLabel}>Practitioner + Client Operating System</Text>
          </View>
          <Text style={[styles.headerGlyph, { color: active.accent }]}>{active.glyph}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroOrb, { borderColor: active.accent, shadowColor: active.accent }]}>
            <Text style={[styles.heroGlyph, { color: active.accent }]}>{active.glyph}</Text>
          </View>

          <Text style={[styles.kicker, { color: active.accent }]}>{active.label}</Text>
          <Text style={styles.title}>{active.title}</Text>
          <Text style={styles.subtitle}>{active.subtitle}</Text>

          {active.key === 'user' ? <UserSection accent={active.accent} /> : null}
          {active.key === 'admin' ? <AdminSection accent={active.accent} /> : null}
          {active.key === 'account' ? <AccountSection accent={active.accent} /> : null}
        </ScrollView>

        <View style={styles.tabBar}>
          {sections.map((section) => {
            const selected = section.key === active.key;
            return (
              <Pressable
                accessibilityLabel={section.label}
                key={section.key}
                onPress={() => setActiveKey(section.key)}
                style={[styles.tab, selected ? { borderColor: section.accent, backgroundColor: `${section.accent}22` } : null]}
              >
                <Text style={[styles.tabGlyph, { color: selected ? section.accent : '#ffffff88' }]}>{section.glyph}</Text>
                <Text style={[styles.tabText, { color: selected ? section.accent : '#ffffff88' }]}>{section.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function UserSection({ accent }: { accent: string }) {
  return (
    <View style={styles.sectionStack}>
      <Panel accent={accent} label="SEARCH">
        <Text style={styles.panelTitle}>Reader Search</Text>
        <Text style={styles.panelBody}>Search input placeholder: “Ryan ☿”, “TheMetaMercury”, or TikTok handle.</Text>
        <View style={styles.readerCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>☿</Text></View>
          <View style={styles.readerInfo}>
            <Text style={styles.readerName}>Ryan · TheMetaMercury</Text>
            <Text style={styles.readerMeta}>Tarot · Human Design · Pattern Reading</Text>
          </View>
          <Text style={[styles.available, { color: accent }]}>Live</Text>
        </View>
      </Panel>

      <Panel accent={accent} label="PURCHASE">
        <Text style={styles.panelTitle}>Pay for a Reading</Text>
        <View style={styles.offerRow}>
          <OfferCard title="Mini Read" price="$11" />
          <OfferCard title="Deep Read" price="$22" />
        </View>
        <Text style={styles.panelNote}>Later this opens Stripe Checkout / Payment Sheet. OracleOS never stores raw card numbers.</Text>
      </Panel>

      <Panel accent={accent} label="QUEUE">
        <Text style={styles.panelTitle}>Public Queue Preview</Text>
        {queue.map((item) => <QueueRow item={item} key={item.id} />)}
      </Panel>
    </View>
  );
}

function AdminSection({ accent }: { accent: string }) {
  return (
    <View style={styles.sectionStack}>
      <Panel accent={accent} label="LOGIN GATE">
        <Text style={styles.panelTitle}>Admin Login</Text>
        <Text style={styles.panelBody}>Supabase admin auth placeholder. Approved admins get queue controls; regular users never see this console.</Text>
      </Panel>

      <Panel accent={accent} label="SLOTS">
        <Text style={styles.panelTitle}>Reading Slots</Text>
        <View style={styles.counterRow}>
          <Pressable style={[styles.actionButton, { borderColor: `${accent}aa` }]}><Text style={styles.actionText}>− Remove Slot</Text></Pressable>
          <Text style={styles.slotCount}>3 open</Text>
          <Pressable style={[styles.actionButton, { borderColor: `${accent}aa` }]}><Text style={styles.actionText}>+ Add Slot</Text></Pressable>
        </View>
      </Panel>

      <Panel accent={accent} label="QUEUE CONTROL">
        <Text style={styles.panelTitle}>Move Status</Text>
        {queue.map((item) => <AdminQueueRow accent={accent} item={item} key={item.id} />)}
      </Panel>
    </View>
  );
}

function AccountSection({ accent }: { accent: string }) {
  return (
    <View style={styles.sectionStack}>
      <Panel accent={accent} label="AUTH">
        <Text style={styles.panelTitle}>Login / Create Account</Text>
        <Text style={styles.panelBody}>Supabase email magic-link / OAuth placeholder. Same identity can later connect MagickOS + OracleOS.</Text>
      </Panel>

      <Panel accent={accent} label="PROFILE">
        <Text style={styles.panelTitle}>Client Details</Text>
        <DetailRow label="Name" value="Ryan Palmer" />
        <DetailRow label="Email" value="ryan@themetamercury.com" />
        <DetailRow label="TikTok" value="@themetamercury" />
      </Panel>

      <Panel accent={accent} label="PAYMENT">
        <Text style={styles.panelTitle}>Saved Payment Method</Text>
        <Text style={styles.panelBody}>Stripe customer portal / setup intent placeholder. Save cards through Stripe only — never raw card data in OracleOS.</Text>
        <View style={styles.paymentCard}>
          <Text style={styles.paymentBrand}>VISA</Text>
          <Text style={styles.paymentText}>•••• 4242 · future readings</Text>
        </View>
      </Panel>
    </View>
  );
}

function Panel({ accent, children, label }: { accent: string; children: React.ReactNode; label: string }) {
  return (
    <View style={[styles.panel, { borderColor: `${accent}44` }]}>
      <Text style={[styles.panelLabel, { color: accent }]}>{label}</Text>
      {children}
    </View>
  );
}

function OfferCard({ price, title }: { price: string; title: string }) {
  return (
    <View style={styles.offerCard}>
      <Text style={styles.offerTitle}>{title}</Text>
      <Text style={styles.offerPrice}>{price}</Text>
    </View>
  );
}

function QueueRow({ item }: { item: QueueItem }) {
  return (
    <View style={styles.queueRow}>
      <View>
        <Text style={styles.queueName}>{item.name}</Text>
        <Text style={styles.queueMeta}>{item.reading} · {item.handle}</Text>
      </View>
      <Text style={[styles.statusPill, { color: statusColors[item.status], borderColor: `${statusColors[item.status]}88` }]}>{item.status}</Text>
    </View>
  );
}

function AdminQueueRow({ accent, item }: { accent: string; item: QueueItem }) {
  return (
    <View style={styles.adminQueueCard}>
      <QueueRow item={item} />
      <View style={styles.statusButtons}>
        {(['Queue', 'Reading', 'Done'] as ReadingStatus[]).map((status) => (
          <Pressable key={status} style={[styles.statusButton, { borderColor: item.status === status ? accent : '#ffffff22' }]}>
            <Text style={[styles.statusButtonText, { color: item.status === status ? accent : '#ffffff88' }]}>{status}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  shell: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  brandRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  brand: { color: '#ffffffdd', fontSize: 14, fontWeight: '900', letterSpacing: 7 },
  modeLabel: { color: '#ffffff66', fontSize: 11, marginTop: 4 },
  headerGlyph: { fontSize: 30, fontWeight: '800' },
  content: { alignItems: 'center', paddingBottom: 28, paddingTop: 28 },
  heroOrb: { alignItems: 'center', borderRadius: 999, borderWidth: 1, height: 112, justifyContent: 'center', shadowOpacity: 0.35, shadowRadius: 28, width: 112 },
  heroGlyph: { fontSize: 54 },
  kicker: { fontSize: 12, fontWeight: '900', letterSpacing: 4, marginTop: 24, textTransform: 'uppercase' },
  title: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -1.2, marginTop: 10, textAlign: 'center' },
  subtitle: { color: '#ffffffa6', fontSize: 16, lineHeight: 25, marginTop: 12, maxWidth: 350, textAlign: 'center' },
  sectionStack: { gap: 14, marginTop: 26, width: '100%' },
  panel: { backgroundColor: '#00000055', borderRadius: 26, borderWidth: 1, padding: 18, width: '100%' },
  panelLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
  panelTitle: { color: '#fff', fontSize: 21, fontWeight: '900' },
  panelBody: { color: '#ffffff99', fontSize: 15, lineHeight: 23, marginTop: 8 },
  panelNote: { color: '#ffffff66', fontSize: 13, lineHeight: 20, marginTop: 12 },
  readerCard: { alignItems: 'center', backgroundColor: '#ffffff0f', borderRadius: 20, flexDirection: 'row', gap: 12, marginTop: 14, padding: 12 },
  avatar: { alignItems: 'center', backgroundColor: '#00000077', borderRadius: 18, height: 44, justifyContent: 'center', width: 44 },
  avatarText: { color: '#67e8f9', fontSize: 24 },
  readerInfo: { flex: 1 },
  readerName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  readerMeta: { color: '#ffffff88', fontSize: 12, marginTop: 3 },
  available: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  offerRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  offerCard: { backgroundColor: '#ffffff0f', borderRadius: 18, flex: 1, padding: 14 },
  offerTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  offerPrice: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 8 },
  queueRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  queueName: { color: '#fff', fontSize: 15, fontWeight: '800' },
  queueMeta: { color: '#ffffff80', fontSize: 12, marginTop: 3 },
  statusPill: { borderRadius: 999, borderWidth: 1, fontSize: 12, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5 },
  counterRow: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'space-between', marginTop: 14 },
  actionButton: { borderRadius: 16, borderWidth: 1, flex: 1, padding: 12 },
  actionText: { color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  slotCount: { color: '#fff', fontSize: 16, fontWeight: '900' },
  adminQueueCard: { backgroundColor: '#ffffff0a', borderRadius: 18, marginTop: 12, padding: 10 },
  statusButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  statusButton: { borderRadius: 14, borderWidth: 1, flex: 1, paddingVertical: 9 },
  statusButtonText: { fontSize: 12, fontWeight: '900', textAlign: 'center' },
  detailRow: { borderBottomColor: '#ffffff14', borderBottomWidth: 1, paddingVertical: 11 },
  detailLabel: { color: '#ffffff66', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  detailValue: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 4 },
  paymentCard: { backgroundColor: '#ffffff12', borderRadius: 20, marginTop: 14, padding: 16 },
  paymentBrand: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 3 },
  paymentText: { color: '#ffffffaa', fontSize: 15, fontWeight: '700', marginTop: 8 },
  tabBar: { backgroundColor: '#00000088', borderColor: '#ffffff18', borderRadius: 28, borderWidth: 1, flexDirection: 'row', gap: 8, marginBottom: 14, padding: 8 },
  tab: { alignItems: 'center', borderColor: 'transparent', borderRadius: 22, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 56 },
  tabGlyph: { fontSize: 22 },
  tabText: { fontSize: 11, fontWeight: '900', marginTop: 2 },
});
