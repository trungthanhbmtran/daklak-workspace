-- CreateTable
CREATE TABLE `employees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NULL,
    `firstname` VARCHAR(191) NOT NULL,
    `lastname` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `employee_code` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL DEFAULT 'male',
    `birthday` DATE NULL,
    `identity_card` VARCHAR(191) NULL,
    `employment_type` VARCHAR(191) NULL,
    `employment_status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `contract_information` JSON NULL,
    `address` LONGTEXT NULL,
    `avatar` TEXT NULL,
    `department_id` INTEGER NULL,
    `job_title_id` INTEGER NULL,
    `civil_servant_rank_id` INTEGER NULL,
    `party_title_id` INTEGER NULL,
    `start_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `employees_employee_code_key`(`employee_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_kpi_settings` (
    `task_id` INTEGER NOT NULL,
    `base_score` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `scoring_method` VARCHAR(191) NOT NULL DEFAULT 'MANUAL',
    `is_cross_domain` BOOLEAN NOT NULL DEFAULT false,
    `cross_domain_multiplier` DOUBLE NOT NULL DEFAULT 1.0,
    `bonus_per_day` DOUBLE NULL,
    `penalty_per_day` DOUBLE NULL,
    `standard_duration_days` DOUBLE NULL,
    `kpi_criteria_id` INTEGER NULL,

    PRIMARY KEY (`task_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpi_periods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpi_criteria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `category_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpi_criteria_settings` (
    `criteria_id` INTEGER NOT NULL,
    `weight` DOUBLE NOT NULL DEFAULT 1.0,
    `base_score` DOUBLE NULL,
    `scoring_method` VARCHAR(191) NOT NULL DEFAULT 'MANUAL',
    `difficulty` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `difficulty_multiplier` DOUBLE NOT NULL DEFAULT 1.0,
    `bonus_threshold_days` INTEGER NOT NULL DEFAULT 0,
    `bonus_per_day` DOUBLE NOT NULL DEFAULT 0,
    `penalty_per_day` DOUBLE NOT NULL DEFAULT 0,
    `integration_code` VARCHAR(191) NULL,
    `formula` VARCHAR(191) NULL,

    PRIMARY KEY (`criteria_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_kpi_targets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_code` VARCHAR(191) NOT NULL,
    `period_id` INTEGER NOT NULL,
    `criteria_id` INTEGER NOT NULL,
    `target_value` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employee_kpi_targets_employee_code_period_id_criteria_id_key`(`employee_code`, `period_id`, `criteria_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_title_kpi_targets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `job_title_id` INTEGER NOT NULL,
    `period_id` INTEGER NOT NULL,
    `criteria_id` INTEGER NOT NULL,
    `target_value` DOUBLE NOT NULL,
    `weight` DOUBLE NOT NULL DEFAULT 1.0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `job_title_kpi_targets_job_title_id_period_id_criteria_id_key`(`job_title_id`, `period_id`, `criteria_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staffing_slot_kpi_targets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staffing_slot_id` INTEGER NOT NULL,
    `period_id` INTEGER NOT NULL,
    `criteria_id` INTEGER NOT NULL,
    `target_value` DOUBLE NOT NULL,
    `weight` DOUBLE NOT NULL DEFAULT 1.0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `staffing_slot_kpi_targets_staffing_slot_id_period_id_criteri_key`(`staffing_slot_id`, `period_id`, `criteria_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpi_evaluations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_code` VARCHAR(191) NOT NULL,
    `period_id` INTEGER NOT NULL,
    `staffing_slot_id` INTEGER NULL,
    `total_score` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `reviewer_code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpi_evaluation_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluation_id` INTEGER NOT NULL,
    `criteria_id` INTEGER NOT NULL,
    `self_score` DOUBLE NULL,
    `reviewer_score` DOUBLE NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'SMART_GOAL',
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `department_id` INTEGER NULL,
    `created_by_code` VARCHAR(191) NULL,
    `document_id` VARCHAR(191) NULL,
    `workflow_code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'TODO',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    `progress` DOUBLE NOT NULL DEFAULT 0,
    `reject_reason` TEXT NULL,
    `start_date` DATE NULL,
    `due_date` DATE NULL,
    `completed_at` DATETIME(3) NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `is_deadline_warned` BOOLEAN NOT NULL DEFAULT false,
    `is_risk_warned` BOOLEAN NOT NULL DEFAULT false,
    `domain_id` INTEGER NULL,
    `monitored_unit_id` INTEGER NULL,
    `plan_id` INTEGER NULL,
    `workflow_instance_id` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `creator_employee_code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `tasks_due_date_idx`(`due_date`),
    INDEX `tasks_status_due_date_idx`(`status`, `due_date`),
    INDEX `tasks_is_completed_due_date_idx`(`is_completed`, `due_date`),
    INDEX `tasks_parent_id_idx`(`parent_id`),
    INDEX `tasks_plan_id_idx`(`plan_id`),
    INDEX `tasks_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_steps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'TODO',
    `order` INTEGER NOT NULL DEFAULT 0,
    `assignee_code` VARCHAR(191) NULL,
    `base_score` DOUBLE NOT NULL DEFAULT 0,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `task_steps_task_id_idx`(`task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'REFERENCE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `task_attachments_task_id_idx`(`task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_participants` (
    `task_id` INTEGER NOT NULL,
    `employee_code` VARCHAR(191) NOT NULL,
    `participant_role` ENUM('OWNER', 'ASSIGNEE', 'APPROVER', 'COORDINATOR', 'FOLLOWER') NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `contribution_percentage` DOUBLE NOT NULL DEFAULT 100.0,

    PRIMARY KEY (`task_id`, `employee_code`, `participant_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_closure` (
    `ancestor_id` INTEGER NOT NULL,
    `descendant_id` INTEGER NOT NULL,
    `depth` INTEGER NOT NULL,

    PRIMARY KEY (`ancestor_id`, `descendant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NOT NULL,
    `author_code` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `is_system_message` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `actor_code` VARCHAR(191) NULL,
    `old_value` JSON NULL,
    `new_value` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `task_histories_task_id_idx`(`task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_rank_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `classification` VARCHAR(191) NOT NULL,
    `rank` VARCHAR(191) NOT NULL,
    `domain_code` VARCHAR(191) NOT NULL DEFAULT 'GENERIC',
    `task_name` VARCHAR(191) NOT NULL,
    `default_unit` VARCHAR(191) NOT NULL,
    `default_weight` DOUBLE NULL,
    `standard_duration_days` DOUBLE NULL,
    `rank_name_vn` VARCHAR(191) NULL,
    `legal_basis` VARCHAR(191) NULL,
    `workflow_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rank_quotas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rank_code` VARCHAR(191) NOT NULL,
    `domain_code` VARCHAR(191) NOT NULL DEFAULT 'GENERIC',
    `task_name` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `target_value` DOUBLE NOT NULL,
    `weight` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `task_kpi_settings` ADD CONSTRAINT `task_kpi_settings_kpi_criteria_id_fkey` FOREIGN KEY (`kpi_criteria_id`) REFERENCES `kpi_criteria`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_kpi_settings` ADD CONSTRAINT `task_kpi_settings_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi_criteria_settings` ADD CONSTRAINT `kpi_criteria_settings_criteria_id_fkey` FOREIGN KEY (`criteria_id`) REFERENCES `kpi_criteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_kpi_targets` ADD CONSTRAINT `employee_kpi_targets_employee_code_fkey` FOREIGN KEY (`employee_code`) REFERENCES `employees`(`employee_code`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_kpi_targets` ADD CONSTRAINT `employee_kpi_targets_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `kpi_periods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_kpi_targets` ADD CONSTRAINT `employee_kpi_targets_criteria_id_fkey` FOREIGN KEY (`criteria_id`) REFERENCES `kpi_criteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_title_kpi_targets` ADD CONSTRAINT `job_title_kpi_targets_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `kpi_periods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_title_kpi_targets` ADD CONSTRAINT `job_title_kpi_targets_criteria_id_fkey` FOREIGN KEY (`criteria_id`) REFERENCES `kpi_criteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staffing_slot_kpi_targets` ADD CONSTRAINT `staffing_slot_kpi_targets_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `kpi_periods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staffing_slot_kpi_targets` ADD CONSTRAINT `staffing_slot_kpi_targets_criteria_id_fkey` FOREIGN KEY (`criteria_id`) REFERENCES `kpi_criteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi_evaluations` ADD CONSTRAINT `kpi_evaluations_employee_code_fkey` FOREIGN KEY (`employee_code`) REFERENCES `employees`(`employee_code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi_evaluations` ADD CONSTRAINT `kpi_evaluations_reviewer_code_fkey` FOREIGN KEY (`reviewer_code`) REFERENCES `employees`(`employee_code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi_evaluations` ADD CONSTRAINT `kpi_evaluations_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `kpi_periods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi_evaluation_details` ADD CONSTRAINT `kpi_evaluation_details_evaluation_id_fkey` FOREIGN KEY (`evaluation_id`) REFERENCES `kpi_evaluations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi_evaluation_details` ADD CONSTRAINT `kpi_evaluation_details_criteria_id_fkey` FOREIGN KEY (`criteria_id`) REFERENCES `kpi_criteria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `master_plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_steps` ADD CONSTRAINT `task_steps_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_attachments` ADD CONSTRAINT `task_attachments_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_participants` ADD CONSTRAINT `task_participants_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_participants` ADD CONSTRAINT `task_participants_employee_code_fkey` FOREIGN KEY (`employee_code`) REFERENCES `employees`(`employee_code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_closure` ADD CONSTRAINT `task_closure_ancestor_id_fkey` FOREIGN KEY (`ancestor_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_closure` ADD CONSTRAINT `task_closure_descendant_id_fkey` FOREIGN KEY (`descendant_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_comments` ADD CONSTRAINT `task_comments_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_histories` ADD CONSTRAINT `task_histories_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
