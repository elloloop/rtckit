/**
 * @elloloop/rtckit-core — headless real-time calling core.
 *
 * Framework-agnostic TypeScript: zero React, zero UI, zero org deps.
 * Public surface only. The React bindings (@elloloop/rtckit-react) and
 * any other framework binding consume exactly what is exported here.
 */

export {
  decideTransport,
  shouldFallbackToSfu,
  SFU_PARTICIPANT_THRESHOLD,
} from './transport/policy';
export type {
  Transport,
  TransportInput,
  TransportDecision,
  MeshHealth,
} from './transport/policy';

export type {
  VideoTransport,
  VideoTransportEvents,
  SfuAdapter,
  LocalMedia,
  RemoteParticipant,
} from './transport/types';

export { PROTOCOL_VERSION, isSignalType } from './signaling/protocol';
export type {
  Envelope,
  SignalMessage,
  SignalType,
} from './signaling/protocol';

export type {
  ParticipantId,
  ParticipantInfo,
  ConnectionQuality,
  TrackKind,
  RoomEventMap,
  RoomEventName,
  RoomEventHandler,
  RoomEvents,
} from './events';
