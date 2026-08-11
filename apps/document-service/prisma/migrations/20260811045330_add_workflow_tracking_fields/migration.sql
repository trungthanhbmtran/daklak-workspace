-- AlterTable
ALTER TABLE `documents` ADD COLUMN `workflow_current_node` VARCHAR(191) NULL,
    ADD COLUMN `workflow_instance_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `documents_workflow_instance_id_idx` ON `documents`(`workflow_instance_id`);
