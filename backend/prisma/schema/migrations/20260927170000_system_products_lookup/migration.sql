-- Systems: replace the free-text `products` column with links to the `products` lookup.

-- CreateTable
CREATE TABLE `system_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `systemId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    INDEX `system_products_productId_idx`(`productId`),
    UNIQUE INDEX `system_products_systemId_productId_key`(`systemId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `system_products` ADD CONSTRAINT `system_products_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_products` ADD CONSTRAINT `system_products_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Carry the free text over: split each system's text on commas/semicolons and link every
-- part that equals a product's code or name, ignoring case and spaces
-- ("Port Control" matches a product named "PortControl"). Parts that match no product
-- are dropped along with the column below.
INSERT IGNORE INTO `system_products` (`systemId`, `productId`)
WITH RECURSIVE parts (systemId, part, rest) AS (
    -- Casts fix the CTE column widths (the anchor row would otherwise make them 0 chars).
    SELECT `id`, CAST('' AS CHAR(100)), CAST(CONCAT(REPLACE(`products`, ';', ','), ',') AS CHAR(101))
    FROM `systems`
  UNION ALL
    SELECT systemId,
           TRIM(SUBSTRING_INDEX(rest, ',', 1)),
           SUBSTRING(rest, LOCATE(',', rest) + 1)
    FROM parts
    WHERE rest <> ''
)
SELECT DISTINCT parts.systemId, p.`id`
FROM parts
JOIN `products` p
  ON LOWER(REPLACE(parts.part, ' ', '')) IN (LOWER(REPLACE(p.`code`, ' ', '')), LOWER(REPLACE(p.`name`, ' ', '')))
WHERE parts.part <> '';

-- AlterTable
ALTER TABLE `systems` DROP COLUMN `products`;
