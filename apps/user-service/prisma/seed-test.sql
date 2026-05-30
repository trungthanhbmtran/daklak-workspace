USE admin_systems;

SET @domainCDS = (SELECT id FROM sys_categories WHERE code = 'CHUYEN_DOI_SO' AND group_code = 'DOMAIN' LIMIT 1);
SET @domainDLS = (SELECT id FROM sys_categories WHERE code = 'DU_LIEU_SO' AND group_code = 'DOMAIN' LIMIT 1);
SET @domainNS = (SELECT id FROM sys_categories WHERE code = 'NGAN_SACH' AND group_code = 'DOMAIN' LIMIT 1);

SET @phogiamdoc = (SELECT id FROM job_titles WHERE code = 'PHO_GIAM_DOC' LIMIT 1);
SET @giamdoc = (SELECT id FROM job_titles WHERE code = 'GIAM_DOC' LIMIT 1);

SET @phongKHTC = (SELECT id FROM organization_units WHERE code = 'SO_KHCN_KHTC' LIMIT 1);
SET @phongQLCN = (SELECT id FROM organization_units WHERE code = 'SO_KHCN_QLCN' LIMIT 1);

UPDATE job_titles SET domain_id = @domainCDS WHERE id = @phogiamdoc;
UPDATE job_titles SET domain_id = @domainNS WHERE id = @giamdoc;

INSERT IGNORE INTO job_title_monitored_units (job_title_id, unit_id) VALUES (@phogiamdoc, @phongQLCN);
INSERT IGNORE INTO job_title_monitored_units (job_title_id, unit_id) VALUES (@giamdoc, @phongKHTC);

INSERT IGNORE INTO organization_unit_domains (unit_id, domain_id) VALUES (@phongQLCN, @domainCDS);
INSERT IGNORE INTO organization_unit_domains (unit_id, domain_id) VALUES (@phongKHTC, @domainNS);
