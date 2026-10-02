ALTER TABLE users ADD COLUMN auth_version INTEGER NOT NULL DEFAULT 0;

CREATE TABLE auth_state_sync (
  user_id INTEGER NOT NULL,
  auth_version INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (user_id),
  INDEX auth_state_sync_status_updated_at_idx (status, updated_at)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE auth_device_sessions (
  id VARCHAR(36) NOT NULL,
  user_id INTEGER NOT NULL,
  auth_version INTEGER NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  revoked_at DATETIME(3) NULL,
  redis_cleaned BOOLEAN NOT NULL DEFAULT false,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX auth_device_sessions_user_id_revoked_at_idx (user_id, revoked_at),
  INDEX auth_device_sessions_revoked_at_redis_cleaned_idx (revoked_at, redis_cleaned)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE auth_refresh_handles (
  hash CHAR(64) NOT NULL,
  session_id VARCHAR(36) NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (hash),
  INDEX auth_refresh_handles_session_id_status_idx (session_id, status),
  CONSTRAINT auth_refresh_handles_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth_device_sessions(id) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `external_identities` (
 `id` VARCHAR(64) NOT NULL, `userId` INTEGER NOT NULL, `issuerHash` CHAR(64) NOT NULL,
 `subjectHash` CHAR(64) NOT NULL, `approvedBy` INTEGER NOT NULL,
 `approvedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `disabledAt` DATETIME(3) NULL,
 PRIMARY KEY (`id`), UNIQUE INDEX `external_identities_issuerHash_subjectHash_key` (`issuerHash`,`subjectHash`),
 INDEX `external_identities_userId_idx` (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
