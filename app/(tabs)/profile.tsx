import { StyleSheet, View, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SignOutButton } from '@/components/sign-out-button';
import { useUser } from '@clerk/clerk-expo';

export default function ProfileScreen() {
  const { user } = useUser();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Perfil</ThemedText>
      </View>

      <View style={styles.content}>
        {user?.imageUrl && (
          <Image
            source={{ uri: user.imageUrl }}
            style={styles.avatar}
          />
        )}

        <View style={styles.infoContainer}>
          <ThemedText style={styles.label}>Nombre</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.value}>
            {user?.fullName || 'Sin nombre'}
          </ThemedText>
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.label}>Correo electrónico</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.value}>
            {user?.emailAddresses[0]?.emailAddress || 'Sin correo'}
          </ThemedText>
        </View>

        <View style={styles.separator} />

        <SignOutButton />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
    gap: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
});
