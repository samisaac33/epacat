import * as FileSystem from 'expo-file-system';
import type { SyncBatchInput, SyncBatchResult } from '@epacat/shared';
import { dao } from '../db/dao';
import { apiFetch } from './api';

const DEVICE_ID_KEY = 'device_id';

function getDeviceId(): string {
  let id = dao.getSetting(DEVICE_ID_KEY);
  if (!id) {
    id = `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    dao.setSetting(DEVICE_ID_KEY, id);
  }
  return id;
}

export async function uploadPendingPhotos() {
  const photos = dao.getPendingPhotos();
  for (const photo of photos) {
    const form = new FormData();
    form.append('localPhotoId', photo.local_photo_id);
    form.append('visitaClientId', photo.visita_client_id);
    form.append('tipo', photo.tipo);
    form.append('file', {
      uri: photo.uri,
      name: `${photo.local_photo_id}.jpg`,
      type: 'image/jpeg',
    } as unknown as Blob);

    await apiFetch('/photos/upload', { method: 'POST', body: form });
    dao.markPhotoUploaded(photo.local_photo_id);
  }
}

export async function syncToServer(): Promise<SyncBatchResult> {
  await uploadPendingPhotos();

  const queue = dao.getSyncQueue();
  if (queue.length === 0) {
    throw new Error('No hay operaciones pendientes de sincronizar');
  }

  const clientBatchId = `${Date.now()}-${Math.random().toString(36).slice(2)}-batch`;
  const operations = queue.map((q) => ({
    opId: q.op_id,
    type: q.op_type as 'CREATE' | 'UPDATE',
    entity: q.entity as SyncBatchInput['operations'][0]['entity'],
    clientEntityId: q.client_entity_id,
    payload: JSON.parse(q.payload),
  }));

  const result = await apiFetch<SyncBatchResult>('/sync/batches', {
    method: 'POST',
    body: JSON.stringify({
      clientBatchId,
      deviceId: getDeviceId(),
      operations,
    } satisfies SyncBatchInput),
  });

  if (result.conflicts.length === 0 || result.accepted > 0) {
    dao.clearSyncQueue();
    dao.markAllSynced();
  }

  return result;
}
