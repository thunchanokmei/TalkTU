import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.profileSection}>
        <View style={styles.avatarPlaceholder} />

        <Text style={styles.name}>Your Name</Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => console.log('Edit Profile')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.accountSection}>
        <TouchableOpacity onPress={() => console.log('Log out')}>
          <Text style={styles.accountText}>Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log('Delete Account')}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.replace('/swipe')}>
          <Text style={styles.navItem}>Swap</Text>
        </TouchableOpacity>

        <Text style={styles.navItem}>Like</Text>
        <Text style={styles.navItem}>Board</Text>

        <TouchableOpacity onPress={() => router.replace('/chat')}>
          <Text style={styles.navItem}>Chat</Text>
        </TouchableOpacity>

        <Text style={[styles.navItem, styles.activeNavItem]}>Profile</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },

  profileSection: {
    alignItems: 'center',
    marginTop: 50,
  },

  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
  },

  name: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },

  editButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 30,
  },

  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  accountSection: {
    alignItems: 'center',
    marginTop: 60,
    gap: 18,
  },

  accountText: {
    fontSize: 16,
  },

  deleteText: {
    fontSize: 16,
    color: '#d33',
  },

  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navItem: {
    fontSize: 14,
    color: '#777',
  },

  activeNavItem: {
    color: '#000',
    fontWeight: '700',
  },
});