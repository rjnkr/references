/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.20-11.8.9-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: tidalis_references
-- ------------------------------------------------------
-- Server version	11.8.9-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES
('0c393031-79ac-4040-8861-dbb01e91aac2','307559b1f14185f1733c4b408d5f49ee30666fa064fbbc8b53827b91acfa7c49','2026-09-09 21:00:57.312','20260909210057_add_ais_project_type',NULL,NULL,'2026-09-09 21:00:57.289',1),
('17d1d3b1-7615-4086-bd30-a5a34bceb6ea','dcedcb97bd4341da11f7327335717757c60cde84fa5d7a7aaa28730da89c0b6b','2026-09-07 19:48:44.229','20260907194844_make_project_system_unlocode_required',NULL,NULL,'2026-09-07 19:48:44.204',1),
('1a9c74f8-0079-4553-88ba-1f22508ca169','2b05429eb0e997d2752c509169612044c5cf3bed17da54b99ed69c80a62d8dc7','2026-09-10 09:39:59.784','20260910093952_add_url_types_rename_project_tags',NULL,NULL,'2026-09-10 09:39:59.714',1),
('1ee20bb5-8944-4d4a-8bd9-72684d78a04c','76813e43fbd08d1aac2f0b52dd226fded0864b29504f87f4bdabd8498a6000d3','2026-09-04 20:22:41.386','20260904202241_init',NULL,NULL,'2026-09-04 20:22:41.228',1),
('2bfe7b84-12d5-423e-bc2f-36cf62a1ad2d','d259ecc660e6eea80e2734883a33e4b31ca8121138aed6c66900b3ab2d963202','2026-09-10 09:19:19.542','20260910091919_add_project_name_enddate_tags',NULL,NULL,'2026-09-10 09:19:19.532',1),
('423c5c23-61cb-4ad7-835f-5710b0527652','b36566213ad96ba14736c3c4d568fa0a078109c625725d640faeb590569c0465','2026-09-10 13:54:24.329','20260910135417_remove_system_show_on_map',NULL,NULL,'2026-09-10 13:54:24.320',1),
('53009244-0cb4-4941-9aa8-6e7b453138d1','3092ed165e7f7a3cb9c6956d73135ae10fd4fea0401201060c52c241c20749a0','2026-09-07 20:50:14.752','20260907205014_add_project_url',NULL,NULL,'2026-09-07 20:50:14.747',1),
('66cde975-1165-4260-9235-30eacc265298','e71e69d266ecdc9796099eb5ee168baeac7a90469dfe0e50413c391557b91a33','2026-09-11 14:31:28.191','20260911143128_add_internal_notes',NULL,NULL,'2026-09-11 14:31:28.180',1),
('746ce724-1b91-414a-ae33-4f73678deadd','ef441fa34a631cf0b1734256aea369d4162324e3381e4c0ab0230737a9e18c6e','2026-09-09 17:16:03.003','20260909171602_add_project_soft_delete',NULL,NULL,'2026-09-09 17:16:02.985',1),
('7ebdaf7f-1336-49b9-b562-9b0f4990b6fd','b0537a5c06e25987abd4cd02642985279fa301e78a0616bd793a365d28350498','2026-09-09 16:39:33.874','20260909163933_add_project_audit_log',NULL,NULL,'2026-09-09 16:39:33.868',1),
('9260e63c-b9e5-47a2-8867-6a892e947d8f','ee4fb886edf60cd29dba0a20280044b6161fc62201084e82fb1940fbbc09c567','2026-09-05 07:13:26.874','20260905071326_add_unlocode_coordinates',NULL,NULL,'2026-09-05 07:13:26.869',1),
('9392b4dc-6b5c-4fc0-8edb-d117852e429a','7b72756391e2917de6fe785b5784068ad5e6ae7233d22aabac5a18874c1afb1d','2026-09-10 08:32:03.994','20260910083203_add_system_entity',NULL,NULL,'2026-09-10 08:32:03.824',1),
('a1217d0d-2b85-448e-a154-7f2da4426af6','c15920dfebb8597ebdb579b6d95a36f50c1c94c5ab03c982addfe83057ac7ccb','2026-09-10 17:47:03.287','20260910174653_add_module_lookup',NULL,NULL,'2026-09-10 17:47:03.219',1),
('ae1d25fe-1c12-4134-b6fd-1769d2b27211','2bb200ed4ba0b408d25810f925b02fda22a632fbc6bf0a10f2bcec14ff699a38','2026-09-10 08:34:45.110','20260910083419_drop_project_system_fields',NULL,NULL,'2026-09-10 08:34:44.946',1),
('b0517730-0fb6-4d3d-bbeb-6a133f1267ee','5de739a0b74b492130c0d85a6bcccfd174e0f8c5820afe95dd815688d0987978','2026-09-07 19:33:45.276','20260907193345_add_project_system_unlocode',NULL,NULL,'2026-09-07 19:33:45.255',1),
('b8f30b65-61c5-44ce-a9a6-d3738b847c1c','495a8c97b7a702b27f4c4d0051daa24ac926d4b67ed3f92b6e5c7a7092defd2f','2026-09-10 10:50:14.011','20260910105013_project_system_urls',NULL,NULL,'2026-09-10 10:50:13.974',1),
('d177d279-0fa4-4743-bd3e-befb0a4e9d7e','82907c9494acfae61516b2566beb72273dc004a6750ca3c208cdad110d0b077c','2026-09-08 18:49:35.965','20260908184935_add_project_show_on_map',NULL,NULL,'2026-09-08 18:49:35.958',1),
('d861807a-8036-4261-91a8-9493837cb131','ce82c54b45266af81a61d07a0326da3f0e206f487fb5054c3ea1ba45c384313d','2026-09-07 18:55:37.005','20260907185536_make_project_number_optional',NULL,NULL,'2026-09-07 18:55:36.993',1),
('ee75f1ae-c6f2-4d84-b5a3-973a1275c4ca','f6ce1e3ef6c7d9df5f96c0e00b733ee54439c71386b04429e6d019e6a02622fb','2026-09-10 09:55:03.664','20260910095503_add_project_documents',NULL,NULL,'2026-09-10 09:55:03.616',1),
('f0edf2e3-52d8-4636-8f0d-673070680f89','d0e0cb2d276c16e75c6c18b1d4d05fd7f5367457b4fede831979ff5d50313f01','2026-09-10 10:17:43.904','20260910101743_add_tags',NULL,NULL,'2026-09-10 10:17:43.862',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `isoCode` varchar(2) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `countries_isoCode_key` (`isoCode`),
  UNIQUE KEY `countries_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=251 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES
(1,'AF','Afghanistan'),
(2,'AX','Åland Islands'),
(3,'AL','Albania'),
(4,'DZ','Algeria'),
(5,'AS','American Samoa'),
(6,'AD','Andorra'),
(7,'AO','Angola'),
(8,'AI','Anguilla'),
(9,'AQ','Antarctica'),
(10,'AG','Antigua and Barbuda'),
(11,'AR','Argentina'),
(12,'AM','Armenia'),
(13,'AW','Aruba'),
(14,'AU','Australia'),
(15,'AT','Austria'),
(16,'AZ','Azerbaijan'),
(17,'BS','Bahamas'),
(18,'BH','Bahrain'),
(19,'BD','Bangladesh'),
(20,'BB','Barbados'),
(21,'BY','Belarus'),
(22,'BE','Belgium'),
(23,'BZ','Belize'),
(24,'BJ','Benin'),
(25,'BM','Bermuda'),
(26,'BT','Bhutan'),
(27,'BO','Bolivia'),
(28,'BQ','Bonaire, Sint Eustatius and Saba'),
(29,'BA','Bosnia and Herzegovina'),
(30,'BW','Botswana'),
(31,'BV','Bouvet Island'),
(32,'BR','Brazil'),
(33,'IO','British Indian Ocean Territory'),
(34,'BN','Brunei Darussalam'),
(35,'BG','Bulgaria'),
(36,'BF','Burkina Faso'),
(37,'BI','Burundi'),
(38,'CV','Cabo Verde'),
(39,'KH','Cambodia'),
(40,'CM','Cameroon'),
(41,'CA','Canada'),
(42,'KY','Cayman Islands'),
(43,'CF','Central African Republic'),
(44,'TD','Chad'),
(45,'CL','Chile'),
(46,'CN','China'),
(47,'CX','Christmas Island'),
(48,'CC','Cocos (Keeling) Islands'),
(49,'CO','Colombia'),
(50,'KM','Comoros'),
(51,'CG','Congo'),
(52,'CD','Congo (Democratic Republic of the)'),
(53,'CK','Cook Islands'),
(54,'CR','Costa Rica'),
(55,'CI','Côte d\'Ivoire'),
(56,'HR','Croatia'),
(57,'CU','Cuba'),
(58,'CW','Curaçao'),
(59,'CY','Cyprus'),
(60,'CZ','Czechia'),
(61,'DK','Denmark'),
(62,'DJ','Djibouti'),
(63,'DM','Dominica'),
(64,'DO','Dominican Republic'),
(65,'EC','Ecuador'),
(66,'EG','Egypt'),
(67,'SV','El Salvador'),
(68,'GQ','Equatorial Guinea'),
(69,'ER','Eritrea'),
(70,'EE','Estonia'),
(71,'SZ','Eswatini'),
(72,'ET','Ethiopia'),
(73,'FK','Falkland Islands'),
(74,'FO','Faroe Islands'),
(75,'FJ','Fiji'),
(76,'FI','Finland'),
(77,'FR','France'),
(78,'GF','French Guiana'),
(79,'PF','French Polynesia'),
(80,'TF','French Southern Territories'),
(81,'GA','Gabon'),
(82,'GM','Gambia'),
(83,'GE','Georgia'),
(84,'DE','Germany'),
(85,'GH','Ghana'),
(86,'GI','Gibraltar'),
(87,'GR','Greece'),
(88,'GL','Greenland'),
(89,'GD','Grenada'),
(90,'GP','Guadeloupe'),
(91,'GU','Guam'),
(92,'GT','Guatemala'),
(93,'GG','Guernsey'),
(94,'GN','Guinea'),
(95,'GW','Guinea-Bissau'),
(96,'GY','Guyana'),
(97,'HT','Haiti'),
(98,'HM','Heard Island and McDonald Islands'),
(99,'VA','Holy See'),
(100,'HN','Honduras'),
(101,'HK','Hong Kong'),
(102,'HU','Hungary'),
(103,'IS','Iceland'),
(104,'IN','India'),
(105,'ID','Indonesia'),
(106,'IR','Iran'),
(107,'IQ','Iraq'),
(108,'IE','Ireland'),
(109,'IM','Isle of Man'),
(110,'IL','Israel'),
(111,'IT','Italy'),
(112,'JM','Jamaica'),
(113,'JP','Japan'),
(114,'JE','Jersey'),
(115,'JO','Jordan'),
(116,'KZ','Kazakhstan'),
(117,'KE','Kenya'),
(118,'KI','Kiribati'),
(119,'KP','Korea (Democratic People\'s Republic of)'),
(120,'KR','Korea (Republic of)'),
(121,'KW','Kuwait'),
(122,'KG','Kyrgyzstan'),
(123,'LA','Lao People\'s Democratic Republic'),
(124,'LV','Latvia'),
(125,'LB','Lebanon'),
(126,'LS','Lesotho'),
(127,'LR','Liberia'),
(128,'LY','Libya'),
(129,'LI','Liechtenstein'),
(130,'LT','Lithuania'),
(131,'LU','Luxembourg'),
(132,'MO','Macao'),
(133,'MG','Madagascar'),
(134,'MW','Malawi'),
(135,'MY','Malaysia'),
(136,'MV','Maldives'),
(137,'ML','Mali'),
(138,'MT','Malta'),
(139,'MH','Marshall Islands'),
(140,'MQ','Martinique'),
(141,'MR','Mauritania'),
(142,'MU','Mauritius'),
(143,'YT','Mayotte'),
(144,'MX','Mexico'),
(145,'FM','Micronesia'),
(146,'MD','Moldova'),
(147,'MC','Monaco'),
(148,'MN','Mongolia'),
(149,'ME','Montenegro'),
(150,'MS','Montserrat'),
(151,'MA','Morocco'),
(152,'MZ','Mozambique'),
(153,'MM','Myanmar'),
(154,'NA','Namibia'),
(155,'NR','Nauru'),
(156,'NP','Nepal'),
(157,'NL','Netherlands'),
(158,'NC','New Caledonia'),
(159,'NZ','New Zealand'),
(160,'NI','Nicaragua'),
(161,'NE','Niger'),
(162,'NG','Nigeria'),
(163,'NU','Niue'),
(164,'NF','Norfolk Island'),
(165,'MK','North Macedonia'),
(166,'MP','Northern Mariana Islands'),
(167,'NO','Norway'),
(168,'OM','Oman'),
(169,'PK','Pakistan'),
(170,'PW','Palau'),
(171,'PS','Palestine'),
(172,'PA','Panama'),
(173,'PG','Papua New Guinea'),
(174,'PY','Paraguay'),
(175,'PE','Peru'),
(176,'PH','Philippines'),
(177,'PN','Pitcairn'),
(178,'PL','Poland'),
(179,'PT','Portugal'),
(180,'PR','Puerto Rico'),
(181,'QA','Qatar'),
(182,'RE','Réunion'),
(183,'RO','Romania'),
(184,'RU','Russian Federation'),
(185,'RW','Rwanda'),
(186,'BL','Saint Barthélemy'),
(187,'SH','Saint Helena, Ascension and Tristan da Cunha'),
(188,'KN','Saint Kitts and Nevis'),
(189,'LC','Saint Lucia'),
(190,'MF','Saint Martin (French part)'),
(191,'PM','Saint Pierre and Miquelon'),
(192,'VC','Saint Vincent and the Grenadines'),
(193,'WS','Samoa'),
(194,'SM','San Marino'),
(195,'ST','Sao Tome and Principe'),
(196,'SA','Saudi Arabia'),
(197,'SN','Senegal'),
(198,'RS','Serbia'),
(199,'SC','Seychelles'),
(200,'SL','Sierra Leone'),
(201,'SG','Singapore'),
(202,'SX','Sint Maarten (Dutch part)'),
(203,'SK','Slovakia'),
(204,'SI','Slovenia'),
(205,'SB','Solomon Islands'),
(206,'SO','Somalia'),
(207,'ZA','South Africa'),
(208,'GS','South Georgia and the South Sandwich Islands'),
(209,'SS','South Sudan'),
(210,'ES','Spain'),
(211,'LK','Sri Lanka'),
(212,'SD','Sudan'),
(213,'SR','Suriname'),
(214,'SJ','Svalbard and Jan Mayen'),
(215,'SE','Sweden'),
(216,'CH','Switzerland'),
(217,'SY','Syrian Arab Republic'),
(218,'TW','Taiwan'),
(219,'TJ','Tajikistan'),
(220,'TZ','Tanzania'),
(221,'TH','Thailand'),
(222,'TL','Timor-Leste'),
(223,'TG','Togo'),
(224,'TK','Tokelau'),
(225,'TO','Tonga'),
(226,'TT','Trinidad and Tobago'),
(227,'TN','Tunisia'),
(228,'TR','Türkiye'),
(229,'TM','Turkmenistan'),
(230,'TC','Turks and Caicos Islands'),
(231,'TV','Tuvalu'),
(232,'UG','Uganda'),
(233,'UA','Ukraine'),
(234,'AE','United Arab Emirates'),
(235,'GB','United Kingdom'),
(236,'US','United States of America'),
(237,'UM','United States Minor Outlying Islands'),
(238,'UY','Uruguay'),
(239,'UZ','Uzbekistan'),
(240,'VU','Vanuatu'),
(241,'VE','Venezuela'),
(242,'VN','Viet Nam'),
(243,'VG','Virgin Islands (British)'),
(244,'VI','Virgin Islands (U.S.)'),
(245,'WF','Wallis and Futuna'),
(246,'EH','Western Sahara'),
(247,'YE','Yemen'),
(248,'ZM','Zambia'),
(249,'ZW','Zimbabwe');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `currencies`
--

DROP TABLE IF EXISTS `currencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `currencies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(3) NOT NULL,
  `name` varchar(100) NOT NULL,
  `symbol` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `currencies_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currencies`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `currencies` WRITE;
/*!40000 ALTER TABLE `currencies` DISABLE KEYS */;
INSERT INTO `currencies` VALUES
(1,'EUR','Euro','€'),
(2,'USD','US Dollar','$'),
(3,'GBP','Pound Sterling','£'),
(4,'CAD','Canadian Dollar','CA$'),
(5,'AUD','Australian Dollar','A$'),
(6,'NZD','New Zealand Dollar','NZ$'),
(7,'CHF','Swiss Franc','CHF'),
(8,'JPY','Japanese Yen','¥'),
(9,'CNY','Chinese Yuan Renminbi','¥'),
(10,'SEK','Swedish Krona','kr'),
(11,'NOK','Norwegian Krone','kr'),
(12,'DKK','Danish Krone','kr'),
(13,'ISK','Iceland Krona','kr'),
(14,'PLN','Polish Zloty','zł'),
(15,'CZK','Czech Koruna','Kč'),
(16,'HUF','Hungarian Forint','Ft'),
(17,'RON','Romanian Leu','lei'),
(18,'BGN','Bulgarian Lev','лв'),
(19,'TRY','Turkish Lira','₺'),
(20,'SGD','Singapore Dollar','S$'),
(21,'HKD','Hong Kong Dollar','HK$'),
(22,'MYR','Malaysian Ringgit','RM'),
(23,'IDR','Indonesian Rupiah','Rp'),
(24,'THB','Thai Baht','฿'),
(25,'PHP','Philippine Peso','₱'),
(26,'VND','Vietnamese Dong','₫'),
(27,'INR','Indian Rupee','₹'),
(28,'PKR','Pakistan Rupee','₨'),
(29,'KRW','South Korean Won','₩'),
(30,'TWD','New Taiwan Dollar','NT$'),
(31,'AED','UAE Dirham','د.إ'),
(32,'SAR','Saudi Riyal','﷼'),
(33,'QAR','Qatari Rial','﷼'),
(34,'KWD','Kuwaiti Dinar','د.ك'),
(35,'BHD','Bahraini Dinar','.د.ب'),
(36,'OMR','Rial Omani','﷼'),
(37,'ILS','New Israeli Sheqel','₪'),
(38,'EGP','Egyptian Pound','E£'),
(39,'MAD','Moroccan Dirham','د.م.'),
(40,'ZAR','South African Rand','R'),
(41,'NGN','Nigerian Naira','₦'),
(42,'KES','Kenyan Shilling','KSh'),
(43,'GHS','Ghana Cedi','₵'),
(44,'BRL','Brazilian Real','R$'),
(45,'MXN','Mexican Peso','Mex$'),
(46,'ARS','Argentine Peso','$'),
(47,'CLP','Chilean Peso','$'),
(48,'COP','Colombian Peso','$'),
(49,'PEN','Peruvian Sol','S/'),
(50,'PAN','Panamanian Balboa','B/.'),
(52,'HRK','Croatian Kuna','kn');
/*!40000 ALTER TABLE `currencies` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `document_types`
--

DROP TABLE IF EXISTS `document_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `document_types_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_types`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `document_types` WRITE;
/*!40000 ALTER TABLE `document_types` DISABLE KEYS */;
INSERT INTO `document_types` VALUES
(2,'Acceptance Certificate'),
(4,'As-Built Documentation'),
(1,'Contract'),
(6,'Manual'),
(7,'Other'),
(3,'Technical Specification'),
(8,'Test Report');
/*!40000 ALTER TABLE `document_types` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `modules_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
INSERT INTO `modules` VALUES
(2,'Reporting'),
(1,'Vessel Traffic Image');
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `project_audit_logs`
--

DROP TABLE IF EXISTS `project_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectId` int(11) NOT NULL,
  `projectNumber` varchar(50) DEFAULT NULL,
  `projectName` varchar(100) NOT NULL,
  `action` enum('CREATE','UPDATE','DELETE','RESTORE') NOT NULL,
  `beforeData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`beforeData`)),
  `afterData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`afterData`)),
  `changedFields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changedFields`)),
  `userId` int(11) DEFAULT NULL,
  `userEmail` varchar(255) NOT NULL,
  `userName` varchar(150) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `project_audit_logs_projectId_idx` (`projectId`),
  KEY `project_audit_logs_createdAt_idx` (`createdAt`),
  KEY `project_audit_logs_action_idx` (`action`)
) ENGINE=InnoDB AUTO_INCREMENT=476 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_audit_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `project_audit_logs` WRITE;
/*!40000 ALTER TABLE `project_audit_logs` DISABLE KEYS */;
INSERT INTO `project_audit_logs` VALUES
(468,156,NULL,'Project #156','CREATE',NULL,'{\"id\":156,\"projectNumber\":null,\"name\":\"COLWIDTH_TEST_TEMP\",\"awardDate\":\"2026-01-01T00:00:00.000Z\",\"endDate\":null,\"projectType\":[],\"implementationPrice\":1000,\"maintenancePricePerYear\":100,\"currencyId\":31,\"systemId\":null,\"newDevelopments\":null,\"implementationDetails\":null,\"pipedriveNumber\":null,\"deleted\":false,\"createdAt\":\"2026-09-10T20:28:27.608Z\",\"updatedAt\":\"2026-09-10T20:28:27.608Z\",\"currency\":{\"id\":31,\"code\":\"AED\",\"name\":\"UAE Dirham\",\"symbol\":\"د.إ\"},\"system\":null,\"completionDates\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 20:28:27.625'),
(469,156,NULL,'Flinders, FPH','UPDATE','{\"id\":156,\"projectNumber\":null,\"name\":\"COLWIDTH_TEST_TEMP\",\"awardDate\":\"2026-01-01T00:00:00.000Z\",\"endDate\":null,\"projectType\":[],\"implementationPrice\":1000,\"maintenancePricePerYear\":100,\"currencyId\":31,\"systemId\":null,\"newDevelopments\":null,\"implementationDetails\":null,\"pipedriveNumber\":null,\"deleted\":false,\"createdAt\":\"2026-09-10T20:28:27.608Z\",\"updatedAt\":\"2026-09-10T20:28:27.608Z\",\"currency\":{\"id\":31,\"code\":\"AED\",\"name\":\"UAE Dirham\",\"symbol\":\"د.إ\"},\"system\":null,\"completionDates\":[],\"documents\":[],\"tags\":[],\"urls\":[]}','{\"id\":156,\"projectNumber\":null,\"name\":\"COLWIDTH_TEST_TEMP\",\"awardDate\":\"2026-01-01T00:00:00.000Z\",\"endDate\":null,\"projectType\":[],\"implementationPrice\":1000,\"maintenancePricePerYear\":100,\"currencyId\":31,\"systemId\":156,\"newDevelopments\":null,\"implementationDetails\":null,\"pipedriveNumber\":null,\"deleted\":false,\"createdAt\":\"2026-09-10T20:28:27.608Z\",\"updatedAt\":\"2026-09-10T20:30:36.272Z\",\"currency\":{\"id\":31,\"code\":\"AED\",\"name\":\"UAE Dirham\",\"symbol\":\"د.إ\"},\"system\":{\"id\":156,\"name\":\"Flinders, FPH\",\"scope\":\"to be added\",\"projectType\":\"PMIS\",\"products\":\"PortControl\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":14,\"systemUnlocodeId\":42,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:21:18.525Z\",\"updatedAt\":\"2026-09-10T17:21:18.525Z\"},\"completionDates\":[],\"documents\":[],\"tags\":[],\"urls\":[]}','[\"systemId\"]',1,'dev@tidalis.com','local user','2026-09-10 20:30:36.298'),
(470,156,NULL,'Flinders, FPH','DELETE','{\"id\":156,\"projectNumber\":null,\"name\":\"COLWIDTH_TEST_TEMP\",\"awardDate\":\"2026-01-01T00:00:00.000Z\",\"endDate\":null,\"projectType\":[],\"implementationPrice\":1000,\"maintenancePricePerYear\":100,\"currencyId\":31,\"systemId\":156,\"newDevelopments\":null,\"implementationDetails\":null,\"pipedriveNumber\":null,\"deleted\":false,\"createdAt\":\"2026-09-10T20:28:27.608Z\",\"updatedAt\":\"2026-09-10T20:30:36.272Z\",\"currency\":{\"id\":31,\"code\":\"AED\",\"name\":\"UAE Dirham\",\"symbol\":\"د.إ\"},\"system\":{\"id\":156,\"name\":\"Flinders, FPH\",\"scope\":\"to be added\",\"projectType\":\"PMIS\",\"products\":\"PortControl\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":14,\"systemUnlocodeId\":42,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:21:18.525Z\",\"updatedAt\":\"2026-09-10T17:21:18.525Z\"},\"completionDates\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,NULL,1,'dev@tidalis.com','local user','2026-09-10 20:32:53.866'),
(471,157,NULL,'Darwin','CREATE',NULL,'{\"id\":157,\"projectNumber\":null,\"name\":\"Test Project Lookup Verify\",\"awardDate\":\"2026-01-09T00:00:00.000Z\",\"endDate\":null,\"projectType\":[],\"implementationPrice\":1000,\"maintenancePricePerYear\":100,\"currencyId\":31,\"systemId\":155,\"newDevelopments\":null,\"implementationDetails\":null,\"pipedriveNumber\":null,\"deleted\":false,\"createdAt\":\"2026-09-10T20:36:05.943Z\",\"updatedAt\":\"2026-09-10T20:36:05.943Z\",\"currency\":{\"id\":31,\"code\":\"AED\",\"name\":\"UAE Dirham\",\"symbol\":\"د.إ\"},\"system\":{\"id\":155,\"name\":\"Darwin\",\"scope\":\"please add\",\"projectType\":\"PMIS\",\"products\":\"Port Control\",\"description\":null,\"customerDetails\":\"Darwin Port Operations Pty Ltd\",\"endUserDetails\":\"Darwin Port Operations Pty Ltd\",\"countryId\":14,\"systemUnlocodeId\":41,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:15:49.410Z\",\"updatedAt\":\"2026-09-10T17:15:49.410Z\"},\"completionDates\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 20:36:05.962'),
(472,157,NULL,'Fremantle','UPDATE','{\"id\":157,\"projectNumber\":null,\"name\":\"Test Project Lookup Verify\",\"awardDate\":\"2026-01-09T00:00:00.000Z\",\"endDate\":null,\"projectType\":[],\"implementationPrice\":1000,\"maintenancePricePerYear\":100,\"currencyId\":31,\"systemId\":155,\"newDevelopments\":null,\"implementationDetails\":null,\"pipedriveNumber\":null,\"deleted\":false,\"createdAt\":\"2026-09-10T20:36:05.943Z\",\"updatedAt\":\"2026-09-10T20:36:05.943Z\",\"currency\":{\"id\":31,\"code\":\"AED\",\"name\":\"UAE Dirham\",\"symbol\":\"د.إ\"},\"system\":{\"id\":155,\"name\":\"Darwin\",\"scope\":\"please add\",\"projectType\":\"PMIS\",\"products\":\"Port Control\",\"description\":null,\"customerDetails\":\"Darwin Port Operations Pty Ltd\",\"endUserDetails\":\"Darwin Port Operations Pty Ltd\",\"countryId\":14,\"systemUnlocodeId\":41,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:15:49.410Z\",\"updatedAt\":\"2026-09-10T17:15:49.410Z\"},\"completionDates\":[],\"documents\":[],\"tags\":[],\"urls\":[]}','{\"id\":157,\"projectNumber\":null,\"name\":\"Test Project Lookup Verify\",\"awardDate\":\"2026-01-09T00:00:00.000Z\",\"endDate\":null,\"projectType\":[],\"implementationPrice\":1000,\"maintenancePricePerYear\":100,\"currencyId\":31,\"systemId\":157,\"newDevelopments\":null,\"implementationDetails\":null,\"pipedriveNumber\":null,\"deleted\":false,\"createdAt\":\"2026-09-10T20:36:05.943Z\",\"updatedAt\":\"2026-09-10T20:44:04.220Z\",\"currency\":{\"id\":31,\"code\":\"AED\",\"name\":\"UAE Dirham\",\"symbol\":\"د.إ\"},\"system\":{\"id\":157,\"name\":\"Fremantle\",\"scope\":\"to be added\",\"projectType\":\"PMIS\",\"products\":\"PortControl\",\"description\":null,\"customerDetails\":\"Fremantle Port Authority\",\"endUserDetails\":\"Fremantle Port Authority\",\"countryId\":14,\"systemUnlocodeId\":49,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:22:54.185Z\",\"updatedAt\":\"2026-09-10T17:22:54.185Z\"},\"completionDates\":[],\"documents\":[],\"tags\":[],\"urls\":[]}','[\"systemId\"]',1,'dev@tidalis.com','local user','2026-09-10 20:44:04.253'),
(473,157,NULL,'Fremantle','DELETE','{\"id\":157,\"projectNumber\":null,\"name\":\"Test Project Lookup Verify\",\"awardDate\":\"2026-01-09T00:00:00.000Z\",\"endDate\":null,\"projectType\":[],\"implementationPrice\":1000,\"maintenancePricePerYear\":100,\"currencyId\":31,\"systemId\":157,\"newDevelopments\":null,\"implementationDetails\":null,\"pipedriveNumber\":null,\"deleted\":false,\"createdAt\":\"2026-09-10T20:36:05.943Z\",\"updatedAt\":\"2026-09-10T20:44:04.220Z\",\"currency\":{\"id\":31,\"code\":\"AED\",\"name\":\"UAE Dirham\",\"symbol\":\"د.إ\"},\"system\":{\"id\":157,\"name\":\"Fremantle\",\"scope\":\"to be added\",\"projectType\":\"PMIS\",\"products\":\"PortControl\",\"description\":null,\"customerDetails\":\"Fremantle Port Authority\",\"endUserDetails\":\"Fremantle Port Authority\",\"countryId\":14,\"systemUnlocodeId\":49,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:22:54.185Z\",\"updatedAt\":\"2026-09-10T17:22:54.185Z\"},\"completionDates\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,NULL,1,'dev@tidalis.com','local user','2026-09-10 20:44:20.468'),
(474,158,NULL,'Project #158','CREATE',NULL,'{\"id\":158,\"projectNumber\":null,\"name\":\"\",\"awardDate\":\"2024-02-01T00:00:00.000Z\",\"endDate\":null,\"projectType\":[],\"implementationPrice\":1000,\"maintenancePricePerYear\":100,\"currencyId\":31,\"systemId\":null,\"newDevelopments\":null,\"implementationDetails\":null,\"pipedriveNumber\":null,\"internalNotes\":\"TEST internal note from automated verification\",\"deleted\":false,\"createdAt\":\"2026-09-11T14:41:12.864Z\",\"updatedAt\":\"2026-09-11T14:41:12.864Z\",\"currency\":{\"id\":31,\"code\":\"AED\",\"name\":\"UAE Dirham\",\"symbol\":\"د.إ\"},\"system\":null,\"completionDates\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-11 14:41:12.879'),
(475,158,NULL,'Project #158','DELETE','{\"id\":158,\"projectNumber\":null,\"name\":\"\",\"awardDate\":\"2024-02-01T00:00:00.000Z\",\"endDate\":null,\"projectType\":[],\"implementationPrice\":1000,\"maintenancePricePerYear\":100,\"currencyId\":31,\"systemId\":null,\"newDevelopments\":null,\"implementationDetails\":null,\"pipedriveNumber\":null,\"internalNotes\":\"TEST internal note from automated verification\",\"deleted\":false,\"createdAt\":\"2026-09-11T14:41:12.864Z\",\"updatedAt\":\"2026-09-11T14:41:12.864Z\",\"currency\":{\"id\":31,\"code\":\"AED\",\"name\":\"UAE Dirham\",\"symbol\":\"د.إ\"},\"system\":null,\"completionDates\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,NULL,1,'dev@tidalis.com','local user','2026-09-11 14:42:01.207');
/*!40000 ALTER TABLE `project_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `project_completion_dates`
--

DROP TABLE IF EXISTS `project_completion_dates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_completion_dates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectId` int(11) NOT NULL,
  `completionDate` date NOT NULL,
  `description` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_completion_dates_projectId_idx` (`projectId`),
  CONSTRAINT `project_completion_dates_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_completion_dates`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `project_completion_dates` WRITE;
/*!40000 ALTER TABLE `project_completion_dates` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_completion_dates` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `project_documents`
--

DROP TABLE IF EXISTS `project_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectId` int(11) NOT NULL,
  `documentTypeId` int(11) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `filePath` varchar(500) NOT NULL,
  `fileSize` int(11) NOT NULL,
  `mimeType` varchar(150) NOT NULL,
  `uploadedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `uploadedBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_documents_projectId_idx` (`projectId`),
  KEY `project_documents_documentTypeId_idx` (`documentTypeId`),
  CONSTRAINT `project_documents_documentTypeId_fkey` FOREIGN KEY (`documentTypeId`) REFERENCES `document_types` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `project_documents_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_documents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `project_documents` WRITE;
/*!40000 ALTER TABLE `project_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_documents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `project_tag_assignments`
--

DROP TABLE IF EXISTS `project_tag_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_tag_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectId` int(11) NOT NULL,
  `tagId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_tag_assignments_projectId_tagId_key` (`projectId`,`tagId`),
  KEY `project_tag_assignments_tagId_idx` (`tagId`),
  CONSTRAINT `project_tag_assignments_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `project_tag_assignments_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_tag_assignments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `project_tag_assignments` WRITE;
/*!40000 ALTER TABLE `project_tag_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_tag_assignments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `project_urls`
--

DROP TABLE IF EXISTS `project_urls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_urls` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectId` int(11) NOT NULL,
  `urlTypeId` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_urls_projectId_idx` (`projectId`),
  KEY `project_urls_urlTypeId_idx` (`urlTypeId`),
  CONSTRAINT `project_urls_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `project_urls_urlTypeId_fkey` FOREIGN KEY (`urlTypeId`) REFERENCES `url_types` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_urls`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `project_urls` WRITE;
/*!40000 ALTER TABLE `project_urls` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_urls` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectNumber` varchar(50) DEFAULT NULL,
  `awardDate` date NOT NULL,
  `implementationPrice` int(11) NOT NULL,
  `maintenancePricePerYear` int(11) NOT NULL,
  `currencyId` int(11) NOT NULL,
  `newDevelopments` text DEFAULT NULL,
  `implementationDetails` text DEFAULT NULL,
  `pipedriveNumber` varchar(50) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `systemId` int(11) DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `projectType` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`projectType`)),
  `internalNotes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `projects_projectNumber_key` (`projectNumber`),
  KEY `projects_currencyId_idx` (`currencyId`),
  KEY `projects_deleted_idx` (`deleted`),
  KEY `projects_systemId_idx` (`systemId`),
  CONSTRAINT `projects_currencyId_fkey` FOREIGN KEY (`currencyId`) REFERENCES `currencies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `projects_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES
(156,NULL,'2026-01-01',1000,100,31,NULL,NULL,NULL,'2026-09-10 20:28:27.608','2026-09-10 20:32:53.860',1,156,NULL,'COLWIDTH_TEST_TEMP','[]',NULL),
(157,NULL,'2026-01-09',1000,100,31,NULL,NULL,NULL,'2026-09-10 20:36:05.943','2026-09-10 20:44:20.464',1,157,NULL,'Test Project Lookup Verify','[]',NULL),
(158,NULL,'2024-02-01',1000,100,31,NULL,NULL,NULL,'2026-09-11 14:41:12.864','2026-09-11 14:42:01.202',1,NULL,NULL,'','[]','TEST internal note from automated verification');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `system_audit_logs`
--

DROP TABLE IF EXISTS `system_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `systemId` int(11) NOT NULL,
  `systemName` varchar(100) NOT NULL,
  `action` enum('CREATE','UPDATE','DELETE','RESTORE') NOT NULL,
  `beforeData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`beforeData`)),
  `afterData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`afterData`)),
  `changedFields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changedFields`)),
  `userId` int(11) DEFAULT NULL,
  `userEmail` varchar(255) NOT NULL,
  `userName` varchar(150) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `system_audit_logs_systemId_idx` (`systemId`),
  KEY `system_audit_logs_createdAt_idx` (`createdAt`),
  KEY `system_audit_logs_action_idx` (`action`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_audit_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `system_audit_logs` WRITE;
/*!40000 ALTER TABLE `system_audit_logs` DISABLE KEYS */;
INSERT INTO `system_audit_logs` VALUES
(17,155,'Darwin','CREATE',NULL,'{\"id\":155,\"name\":\"Darwin\",\"scope\":\"please add\",\"projectType\":\"PMIS\",\"products\":\"Port Control\",\"description\":null,\"customerDetails\":\"Darwin Port Operations Pty Ltd\",\"endUserDetails\":\"Darwin Port Operations Pty Ltd\",\"countryId\":14,\"systemUnlocodeId\":41,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:15:49.410Z\",\"updatedAt\":\"2026-09-10T17:15:49.410Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[{\"id\":70,\"systemId\":155,\"unlocodeId\":41,\"unlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}}],\"modules\":[],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[{\"id\":4,\"systemId\":155,\"tagId\":4,\"tag\":{\"id\":4,\"code\":\"AMERICAS\",\"name\":\"Tidalis Americas\",\"backgroundColor\":\"#4B99EC\",\"textColor\":\"#FFFFFF\"}}],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 17:15:49.442'),
(18,156,'Flinders, FPH','CREATE',NULL,'{\"id\":156,\"name\":\"Flinders, FPH\",\"scope\":\"to be added\",\"projectType\":\"PMIS\",\"products\":\"PortControl\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":14,\"systemUnlocodeId\":42,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:21:18.525Z\",\"updatedAt\":\"2026-09-10T17:21:18.525Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":42,\"code\":\"AUADL\",\"name\":\"Adelaide\",\"countryId\":14,\"latitude\":-34.9167,\"longitude\":138.5833,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[{\"id\":71,\"systemId\":156,\"unlocodeId\":42,\"unlocode\":{\"id\":42,\"code\":\"AUADL\",\"name\":\"Adelaide\",\"countryId\":14,\"latitude\":-34.9167,\"longitude\":138.5833,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}},{\"id\":72,\"systemId\":156,\"unlocodeId\":43,\"unlocode\":{\"id\":43,\"code\":\"AUTHE\",\"name\":\"Thevenard\",\"countryId\":14,\"latitude\":-32.1457473,\"longitude\":133.6540362,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}},{\"id\":73,\"systemId\":156,\"unlocodeId\":44,\"unlocode\":{\"id\":44,\"code\":\"AUKLP\",\"name\":\"Klein Point\",\"countryId\":14,\"latitude\":-35.033,\"longitude\":137.612,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}},{\"id\":74,\"systemId\":156,\"unlocodeId\":45,\"unlocode\":{\"id\":45,\"code\":\"AUPGI\",\"name\":\"Port Giles\",\"countryId\":14,\"latitude\":-35.0219216,\"longitude\":137.7619583,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}},{\"id\":75,\"systemId\":156,\"unlocodeId\":46,\"unlocode\":{\"id\":46,\"code\":\"AUPLO\",\"name\":\"Port Lincoln\",\"countryId\":14,\"latitude\":-34.7211905,\"longitude\":135.8592218,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}},{\"id\":76,\"systemId\":156,\"unlocodeId\":47,\"unlocode\":{\"id\":47,\"code\":\"AUPPI\",\"name\":\"Port Pirie\",\"countryId\":14,\"latitude\":-33.1791249,\"longitude\":138.0058614,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}},{\"id\":77,\"systemId\":156,\"unlocodeId\":48,\"unlocode\":{\"id\":48,\"code\":\"AUWAL\",\"name\":\"Wallaroo\",\"countryId\":14,\"latitude\":-33.9308118,\"longitude\":137.6272608,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}}],\"modules\":[],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[{\"id\":5,\"systemId\":156,\"tagId\":4,\"tag\":{\"id\":4,\"code\":\"AMERICAS\",\"name\":\"Tidalis Americas\",\"backgroundColor\":\"#4B99EC\",\"textColor\":\"#FFFFFF\"}}],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 17:21:18.566'),
(19,157,'Fremantle','CREATE',NULL,'{\"id\":157,\"name\":\"Fremantle\",\"scope\":\"to be added\",\"projectType\":\"PMIS\",\"products\":\"PortControl\",\"description\":null,\"customerDetails\":\"Fremantle Port Authority\",\"endUserDetails\":\"Fremantle Port Authority\",\"countryId\":14,\"systemUnlocodeId\":49,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:22:54.185Z\",\"updatedAt\":\"2026-09-10T17:22:54.185Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":49,\"code\":\"AUFRE\",\"name\":\"Fremantle\",\"countryId\":14,\"latitude\":-32.0534086,\"longitude\":115.7586172,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[{\"id\":78,\"systemId\":157,\"unlocodeId\":49,\"unlocode\":{\"id\":49,\"code\":\"AUFRE\",\"name\":\"Fremantle\",\"countryId\":14,\"latitude\":-32.0534086,\"longitude\":115.7586172,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}}],\"modules\":[],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[{\"id\":6,\"systemId\":157,\"tagId\":4,\"tag\":{\"id\":4,\"code\":\"AMERICAS\",\"name\":\"Tidalis Americas\",\"backgroundColor\":\"#4B99EC\",\"textColor\":\"#FFFFFF\"}}],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 17:22:54.211'),
(20,158,'Gladstone Pilots','CREATE',NULL,'{\"id\":158,\"name\":\"Gladstone Pilots\",\"scope\":\"to be added\",\"projectType\":\"PILOT\",\"products\":\"Pilot Control\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":14,\"systemUnlocodeId\":61,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:24:10.968Z\",\"updatedAt\":\"2026-09-10T17:24:10.968Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":61,\"code\":\"AUGLT\",\"name\":\"Gladstone\",\"countryId\":14,\"latitude\":-23.8489,\"longitude\":151.25,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[{\"id\":79,\"systemId\":158,\"unlocodeId\":61,\"unlocode\":{\"id\":61,\"code\":\"AUGLT\",\"name\":\"Gladstone\",\"countryId\":14,\"latitude\":-23.8489,\"longitude\":151.25,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}}],\"modules\":[],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[{\"id\":7,\"systemId\":158,\"tagId\":4,\"tag\":{\"id\":4,\"code\":\"AMERICAS\",\"name\":\"Tidalis Americas\",\"backgroundColor\":\"#4B99EC\",\"textColor\":\"#FFFFFF\"}}],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 17:24:10.993'),
(21,159,'Playwright Test System','CREATE',NULL,'{\"id\":159,\"name\":\"Playwright Test System\",\"scope\":\"Test scope for playwright verification of the modules lookup feature.\",\"projectType\":\"PMIS\",\"products\":\"Test Product\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":1,\"systemUnlocodeId\":1,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T18:03:40.351Z\",\"updatedAt\":\"2026-09-10T18:03:40.351Z\",\"country\":{\"id\":1,\"isoCode\":\"AF\",\"name\":\"Afghanistan\"},\"systemUnlocode\":{\"id\":1,\"code\":\"NLRTM\",\"name\":\"Rotterdam\",\"countryId\":157,\"latitude\":51.9225,\"longitude\":4.47917,\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"}},\"ports\":[],\"modules\":[{\"id\":1,\"systemId\":159,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}},{\"id\":2,\"systemId\":159,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 18:03:40.375'),
(22,160,'Validation Test With Module','CREATE',NULL,'{\"id\":160,\"name\":\"Validation Test With Module\",\"scope\":\"test\",\"projectType\":\"PMIS\",\"products\":\"test\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":14,\"systemUnlocodeId\":41,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":false,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T18:36:54.088Z\",\"updatedAt\":\"2026-09-10T18:36:54.088Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[],\"modules\":[{\"id\":3,\"systemId\":160,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 18:36:54.116'),
(23,160,'Validation Test With Module','DELETE','{\"id\":160,\"name\":\"Validation Test With Module\",\"scope\":\"test\",\"projectType\":\"PMIS\",\"products\":\"test\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":14,\"systemUnlocodeId\":41,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":false,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T18:36:54.088Z\",\"updatedAt\":\"2026-09-10T18:36:54.088Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[],\"modules\":[{\"id\":3,\"systemId\":160,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,NULL,1,'dev@tidalis.com','local user','2026-09-10 18:36:58.673'),
(24,161,'Validation Test No Modules PW','CREATE',NULL,'{\"id\":161,\"name\":\"Validation Test No Modules PW\",\"scope\":\"Validation scope text for automated test.\",\"projectType\":\"PMIS\",\"products\":\"TestProduct\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":157,\"systemUnlocodeId\":1,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T18:41:52.492Z\",\"updatedAt\":\"2026-09-10T18:41:52.492Z\",\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"},\"systemUnlocode\":{\"id\":1,\"code\":\"NLRTM\",\"name\":\"Rotterdam\",\"countryId\":157,\"latitude\":51.9225,\"longitude\":4.47917,\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"}},\"ports\":[],\"modules\":[{\"id\":4,\"systemId\":161,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 18:41:52.520'),
(25,161,'Validation Test No Modules PW','DELETE','{\"id\":161,\"name\":\"Validation Test No Modules PW\",\"scope\":\"Validation scope text for automated test.\",\"projectType\":\"PMIS\",\"products\":\"TestProduct\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":157,\"systemUnlocodeId\":1,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T18:41:52.492Z\",\"updatedAt\":\"2026-09-10T18:41:52.492Z\",\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"},\"systemUnlocode\":{\"id\":1,\"code\":\"NLRTM\",\"name\":\"Rotterdam\",\"countryId\":157,\"latitude\":51.9225,\"longitude\":4.47917,\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"}},\"ports\":[],\"modules\":[{\"id\":4,\"systemId\":161,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,NULL,1,'dev@tidalis.com','local user','2026-09-10 18:41:54.366'),
(26,162,'Module List Verify PW','CREATE',NULL,'{\"id\":162,\"name\":\"Module List Verify PW\",\"scope\":\"Verification scope for module list rendering test.\",\"projectType\":\"PMIS\",\"products\":\"Test Products\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":157,\"systemUnlocodeId\":1,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T18:51:37.639Z\",\"updatedAt\":\"2026-09-10T18:51:37.639Z\",\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"},\"systemUnlocode\":{\"id\":1,\"code\":\"NLRTM\",\"name\":\"Rotterdam\",\"countryId\":157,\"latitude\":51.9225,\"longitude\":4.47917,\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"}},\"ports\":[],\"modules\":[{\"id\":5,\"systemId\":162,\"moduleId\":4,\"module\":{\"id\":4,\"name\":\"AIS\"}},{\"id\":6,\"systemId\":162,\"moduleId\":7,\"module\":{\"id\":7,\"name\":\"Alarms\"}},{\"id\":7,\"systemId\":162,\"moduleId\":5,\"module\":{\"id\":5,\"name\":\"CCTV\"}},{\"id\":8,\"systemId\":162,\"moduleId\":10,\"module\":{\"id\":10,\"name\":\"Chart Overlay\"}},{\"id\":9,\"systemId\":162,\"moduleId\":3,\"module\":{\"id\":3,\"name\":\"Radar\"}},{\"id\":10,\"systemId\":162,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}},{\"id\":11,\"systemId\":162,\"moduleId\":8,\"module\":{\"id\":8,\"name\":\"Reporting Dashboard\"}},{\"id\":12,\"systemId\":162,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}},{\"id\":13,\"systemId\":162,\"moduleId\":9,\"module\":{\"id\":9,\"name\":\"Voice Recording\"}},{\"id\":14,\"systemId\":162,\"moduleId\":6,\"module\":{\"id\":6,\"name\":\"Weather\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 18:51:37.670'),
(27,159,'Playwright Test System','UPDATE','{\"id\":159,\"name\":\"Playwright Test System\",\"scope\":\"Test scope for playwright verification of the modules lookup feature.\",\"projectType\":\"PMIS\",\"products\":\"Test Product\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":1,\"systemUnlocodeId\":1,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T18:03:40.351Z\",\"updatedAt\":\"2026-09-10T18:03:40.351Z\",\"country\":{\"id\":1,\"isoCode\":\"AF\",\"name\":\"Afghanistan\"},\"systemUnlocode\":{\"id\":1,\"code\":\"NLRTM\",\"name\":\"Rotterdam\",\"countryId\":157,\"latitude\":51.9225,\"longitude\":4.47917,\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"}},\"ports\":[],\"modules\":[{\"id\":1,\"systemId\":159,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}},{\"id\":2,\"systemId\":159,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}','{\"id\":159,\"name\":\"Playwright Test System\",\"scope\":\"Test scope for playwright verification of the modules lookup feature.\",\"projectType\":\"PMIS\",\"products\":\"Test Product\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":1,\"systemUnlocodeId\":1,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T18:03:40.351Z\",\"updatedAt\":\"2026-09-10T18:51:56.606Z\",\"country\":{\"id\":1,\"isoCode\":\"AF\",\"name\":\"Afghanistan\"},\"systemUnlocode\":{\"id\":1,\"code\":\"NLRTM\",\"name\":\"Rotterdam\",\"countryId\":157,\"latitude\":51.9225,\"longitude\":4.47917,\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"}},\"ports\":[],\"modules\":[{\"id\":15,\"systemId\":159,\"moduleId\":4,\"module\":{\"id\":4,\"name\":\"AIS\"}},{\"id\":16,\"systemId\":159,\"moduleId\":7,\"module\":{\"id\":7,\"name\":\"Alarms\"}},{\"id\":17,\"systemId\":159,\"moduleId\":5,\"module\":{\"id\":5,\"name\":\"CCTV\"}},{\"id\":18,\"systemId\":159,\"moduleId\":10,\"module\":{\"id\":10,\"name\":\"Chart Overlay\"}},{\"id\":19,\"systemId\":159,\"moduleId\":3,\"module\":{\"id\":3,\"name\":\"Radar\"}},{\"id\":20,\"systemId\":159,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}},{\"id\":21,\"systemId\":159,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}','[\"modules\"]',1,'dev@tidalis.com','local user','2026-09-10 18:51:56.637'),
(28,162,'Module List Verify PW','DELETE','{\"id\":162,\"name\":\"Module List Verify PW\",\"scope\":\"Verification scope for module list rendering test.\",\"projectType\":\"PMIS\",\"products\":\"Test Products\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":157,\"systemUnlocodeId\":1,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T18:51:37.639Z\",\"updatedAt\":\"2026-09-10T18:51:37.639Z\",\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"},\"systemUnlocode\":{\"id\":1,\"code\":\"NLRTM\",\"name\":\"Rotterdam\",\"countryId\":157,\"latitude\":51.9225,\"longitude\":4.47917,\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"}},\"ports\":[],\"modules\":[{\"id\":5,\"systemId\":162,\"moduleId\":4,\"module\":{\"id\":4,\"name\":\"AIS\"}},{\"id\":6,\"systemId\":162,\"moduleId\":7,\"module\":{\"id\":7,\"name\":\"Alarms\"}},{\"id\":7,\"systemId\":162,\"moduleId\":5,\"module\":{\"id\":5,\"name\":\"CCTV\"}},{\"id\":8,\"systemId\":162,\"moduleId\":10,\"module\":{\"id\":10,\"name\":\"Chart Overlay\"}},{\"id\":9,\"systemId\":162,\"moduleId\":3,\"module\":{\"id\":3,\"name\":\"Radar\"}},{\"id\":10,\"systemId\":162,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}},{\"id\":11,\"systemId\":162,\"moduleId\":8,\"module\":{\"id\":8,\"name\":\"Reporting Dashboard\"}},{\"id\":12,\"systemId\":162,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}},{\"id\":13,\"systemId\":162,\"moduleId\":9,\"module\":{\"id\":9,\"name\":\"Voice Recording\"}},{\"id\":14,\"systemId\":162,\"moduleId\":6,\"module\":{\"id\":6,\"name\":\"Weather\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,NULL,1,'dev@tidalis.com','local user','2026-09-10 19:00:35.824'),
(29,159,'Playwright Test System','DELETE','{\"id\":159,\"name\":\"Playwright Test System\",\"scope\":\"Test scope for playwright verification of the modules lookup feature.\",\"projectType\":\"PMIS\",\"products\":\"Test Product\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":1,\"systemUnlocodeId\":1,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T18:03:40.351Z\",\"updatedAt\":\"2026-09-10T18:51:56.606Z\",\"country\":{\"id\":1,\"isoCode\":\"AF\",\"name\":\"Afghanistan\"},\"systemUnlocode\":{\"id\":1,\"code\":\"NLRTM\",\"name\":\"Rotterdam\",\"countryId\":157,\"latitude\":51.9225,\"longitude\":4.47917,\"country\":{\"id\":157,\"isoCode\":\"NL\",\"name\":\"Netherlands\"}},\"ports\":[],\"modules\":[{\"id\":15,\"systemId\":159,\"moduleId\":4,\"module\":{\"id\":4,\"name\":\"AIS\"}},{\"id\":16,\"systemId\":159,\"moduleId\":7,\"module\":{\"id\":7,\"name\":\"Alarms\"}},{\"id\":17,\"systemId\":159,\"moduleId\":5,\"module\":{\"id\":5,\"name\":\"CCTV\"}},{\"id\":18,\"systemId\":159,\"moduleId\":10,\"module\":{\"id\":10,\"name\":\"Chart Overlay\"}},{\"id\":19,\"systemId\":159,\"moduleId\":3,\"module\":{\"id\":3,\"name\":\"Radar\"}},{\"id\":20,\"systemId\":159,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}},{\"id\":21,\"systemId\":159,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,NULL,1,'dev@tidalis.com','local user','2026-09-10 19:01:09.726'),
(30,163,'Modules Picker Verify PW','CREATE',NULL,'{\"id\":163,\"name\":\"Modules Picker Verify PW\",\"scope\":\"Verification scope text.\",\"projectType\":\"PMIS\",\"products\":\"Test Product\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":14,\"systemUnlocodeId\":42,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T19:14:15.125Z\",\"updatedAt\":\"2026-09-10T19:14:15.125Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":42,\"code\":\"AUADL\",\"name\":\"Adelaide\",\"countryId\":14,\"latitude\":-34.9167,\"longitude\":138.5833,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[],\"modules\":[{\"id\":22,\"systemId\":163,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}},{\"id\":23,\"systemId\":163,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 19:14:15.152'),
(31,164,'Modules Picker Verify PW','CREATE',NULL,'{\"id\":164,\"name\":\"Modules Picker Verify PW\",\"scope\":\"Verification scope text.\",\"projectType\":\"PMIS\",\"products\":\"Test Product\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":14,\"systemUnlocodeId\":42,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T19:15:40.471Z\",\"updatedAt\":\"2026-09-10T19:15:40.471Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":42,\"code\":\"AUADL\",\"name\":\"Adelaide\",\"countryId\":14,\"latitude\":-34.9167,\"longitude\":138.5833,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[],\"modules\":[{\"id\":24,\"systemId\":164,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}},{\"id\":25,\"systemId\":164,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 19:15:40.491'),
(32,165,'Modules Picker Verify PW','CREATE',NULL,'{\"id\":165,\"name\":\"Modules Picker Verify PW\",\"scope\":\"Verification scope text.\",\"projectType\":\"PMIS\",\"products\":\"Test Product\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":14,\"systemUnlocodeId\":42,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T19:18:24.475Z\",\"updatedAt\":\"2026-09-10T19:18:24.475Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":42,\"code\":\"AUADL\",\"name\":\"Adelaide\",\"countryId\":14,\"latitude\":-34.9167,\"longitude\":138.5833,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[],\"modules\":[{\"id\":26,\"systemId\":165,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}},{\"id\":27,\"systemId\":165,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,1,'dev@tidalis.com','local user','2026-09-10 19:18:24.499'),
(33,165,'Modules Picker Verify PW','DELETE','{\"id\":165,\"name\":\"Modules Picker Verify PW\",\"scope\":\"Verification scope text.\",\"projectType\":\"PMIS\",\"products\":\"Test Product\",\"description\":null,\"customerDetails\":null,\"endUserDetails\":null,\"countryId\":14,\"systemUnlocodeId\":42,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T19:18:24.475Z\",\"updatedAt\":\"2026-09-10T19:18:24.475Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":42,\"code\":\"AUADL\",\"name\":\"Adelaide\",\"countryId\":14,\"latitude\":-34.9167,\"longitude\":138.5833,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[],\"modules\":[{\"id\":26,\"systemId\":165,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}},{\"id\":27,\"systemId\":165,\"moduleId\":1,\"module\":{\"id\":1,\"name\":\"Vessel Traffic Image\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[],\"urls\":[]}',NULL,NULL,1,'dev@tidalis.com','local user','2026-09-10 19:19:17.085'),
(34,155,'Darwin','UPDATE','{\"id\":155,\"name\":\"Darwin\",\"scope\":\"please add\",\"projectType\":\"PMIS\",\"products\":\"Port Control\",\"description\":null,\"customerDetails\":\"Darwin Port Operations Pty Ltd\",\"endUserDetails\":\"Darwin Port Operations Pty Ltd\",\"internalNotes\":null,\"countryId\":14,\"systemUnlocodeId\":41,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:15:49.410Z\",\"updatedAt\":\"2026-09-10T17:15:49.410Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[{\"id\":70,\"systemId\":155,\"unlocodeId\":41,\"unlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}}],\"modules\":[],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[{\"id\":4,\"systemId\":155,\"tagId\":4,\"tag\":{\"id\":4,\"code\":\"AMERICAS\",\"name\":\"Tidalis Americas\",\"backgroundColor\":\"#4B99EC\",\"textColor\":\"#FFFFFF\"}}],\"urls\":[]}','{\"id\":155,\"name\":\"Darwin\",\"scope\":\"please add\",\"projectType\":\"PMIS\",\"products\":\"Port Control\",\"description\":null,\"customerDetails\":\"Darwin Port Operations Pty Ltd\",\"endUserDetails\":\"Darwin Port Operations Pty Ltd\",\"internalNotes\":\"TEST internal note from automated verification\",\"countryId\":14,\"systemUnlocodeId\":41,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:15:49.410Z\",\"updatedAt\":\"2026-09-11T14:39:49.107Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[{\"id\":80,\"systemId\":155,\"unlocodeId\":41,\"unlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}}],\"modules\":[{\"id\":28,\"systemId\":155,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[{\"id\":8,\"systemId\":155,\"tagId\":4,\"tag\":{\"id\":4,\"code\":\"AMERICAS\",\"name\":\"Tidalis Americas\",\"backgroundColor\":\"#4B99EC\",\"textColor\":\"#FFFFFF\"}}],\"urls\":[]}','[\"internalNotes\",\"ports\",\"modules\",\"tags\"]',1,'dev@tidalis.com','local user','2026-09-11 14:39:49.134'),
(35,155,'Darwin','UPDATE','{\"id\":155,\"name\":\"Darwin\",\"scope\":\"please add\",\"projectType\":\"PMIS\",\"products\":\"Port Control\",\"description\":null,\"customerDetails\":\"Darwin Port Operations Pty Ltd\",\"endUserDetails\":\"Darwin Port Operations Pty Ltd\",\"internalNotes\":\"TEST internal note from automated verification\",\"countryId\":14,\"systemUnlocodeId\":41,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:15:49.410Z\",\"updatedAt\":\"2026-09-11T14:39:49.107Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[{\"id\":80,\"systemId\":155,\"unlocodeId\":41,\"unlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}}],\"modules\":[{\"id\":28,\"systemId\":155,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[{\"id\":8,\"systemId\":155,\"tagId\":4,\"tag\":{\"id\":4,\"code\":\"AMERICAS\",\"name\":\"Tidalis Americas\",\"backgroundColor\":\"#4B99EC\",\"textColor\":\"#FFFFFF\"}}],\"urls\":[]}','{\"id\":155,\"name\":\"Darwin\",\"scope\":\"please add\",\"projectType\":\"PMIS\",\"products\":\"Port Control\",\"description\":null,\"customerDetails\":\"Darwin Port Operations Pty Ltd\",\"endUserDetails\":\"Darwin Port Operations Pty Ltd\",\"internalNotes\":\"TEST internal note from automated verification\",\"countryId\":14,\"systemUnlocodeId\":41,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:15:49.410Z\",\"updatedAt\":\"2026-09-11T14:41:05.302Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[{\"id\":81,\"systemId\":155,\"unlocodeId\":41,\"unlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}}],\"modules\":[{\"id\":29,\"systemId\":155,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[{\"id\":9,\"systemId\":155,\"tagId\":4,\"tag\":{\"id\":4,\"code\":\"AMERICAS\",\"name\":\"Tidalis Americas\",\"backgroundColor\":\"#4B99EC\",\"textColor\":\"#FFFFFF\"}}],\"urls\":[]}','[\"ports\",\"modules\",\"tags\"]',1,'dev@tidalis.com','local user','2026-09-11 14:41:05.329'),
(36,155,'Darwin','UPDATE','{\"id\":155,\"name\":\"Darwin\",\"scope\":\"please add\",\"projectType\":\"PMIS\",\"products\":\"Port Control\",\"description\":null,\"customerDetails\":\"Darwin Port Operations Pty Ltd\",\"endUserDetails\":\"Darwin Port Operations Pty Ltd\",\"internalNotes\":\"TEST internal note from automated verification\",\"countryId\":14,\"systemUnlocodeId\":41,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:15:49.410Z\",\"updatedAt\":\"2026-09-11T14:41:05.302Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[{\"id\":81,\"systemId\":155,\"unlocodeId\":41,\"unlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}}],\"modules\":[{\"id\":29,\"systemId\":155,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[{\"id\":9,\"systemId\":155,\"tagId\":4,\"tag\":{\"id\":4,\"code\":\"AMERICAS\",\"name\":\"Tidalis Americas\",\"backgroundColor\":\"#4B99EC\",\"textColor\":\"#FFFFFF\"}}],\"urls\":[]}','{\"id\":155,\"name\":\"Darwin\",\"scope\":\"please add\",\"projectType\":\"PMIS\",\"products\":\"Port Control\",\"description\":null,\"customerDetails\":\"Darwin Port Operations Pty Ltd\",\"endUserDetails\":\"Darwin Port Operations Pty Ltd\",\"internalNotes\":null,\"countryId\":14,\"systemUnlocodeId\":41,\"pocName\":null,\"pocEmail\":null,\"pocPhone\":null,\"isSensitive\":false,\"canBeUsedAsReference\":true,\"systemDecommissioned\":false,\"deleted\":false,\"createdAt\":\"2026-09-10T17:15:49.410Z\",\"updatedAt\":\"2026-09-11T14:41:49.237Z\",\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"},\"systemUnlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}},\"ports\":[{\"id\":81,\"systemId\":155,\"unlocodeId\":41,\"unlocode\":{\"id\":41,\"code\":\"AUDRW\",\"name\":\"Darwin\",\"countryId\":14,\"latitude\":-12.45,\"longitude\":130.8333,\"country\":{\"id\":14,\"isoCode\":\"AU\",\"name\":\"Australia\"}}}],\"modules\":[{\"id\":29,\"systemId\":155,\"moduleId\":2,\"module\":{\"id\":2,\"name\":\"Reporting\"}}],\"subSystems\":[],\"externalInterfaces\":[],\"people\":[],\"documents\":[],\"tags\":[{\"id\":9,\"systemId\":155,\"tagId\":4,\"tag\":{\"id\":4,\"code\":\"AMERICAS\",\"name\":\"Tidalis Americas\",\"backgroundColor\":\"#4B99EC\",\"textColor\":\"#FFFFFF\"}}],\"urls\":[]}','[\"internalNotes\"]',1,'dev@tidalis.com','local user','2026-09-11 14:41:49.251');
/*!40000 ALTER TABLE `system_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `system_documents`
--

DROP TABLE IF EXISTS `system_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `systemId` int(11) NOT NULL,
  `documentTypeId` int(11) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `filePath` varchar(500) NOT NULL,
  `fileSize` int(11) NOT NULL,
  `mimeType` varchar(150) NOT NULL,
  `uploadedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `uploadedBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `system_documents_systemId_idx` (`systemId`),
  KEY `system_documents_documentTypeId_idx` (`documentTypeId`),
  CONSTRAINT `system_documents_documentTypeId_fkey` FOREIGN KEY (`documentTypeId`) REFERENCES `document_types` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `system_documents_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_documents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `system_documents` WRITE;
/*!40000 ALTER TABLE `system_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_documents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `system_external_interfaces`
--

DROP TABLE IF EXISTS `system_external_interfaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_external_interfaces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `systemId` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `system_external_interfaces_systemId_idx` (`systemId`),
  CONSTRAINT `system_external_interfaces_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_external_interfaces`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `system_external_interfaces` WRITE;
/*!40000 ALTER TABLE `system_external_interfaces` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_external_interfaces` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `system_modules`
--

DROP TABLE IF EXISTS `system_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `systemId` int(11) NOT NULL,
  `moduleId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_modules_systemId_moduleId_key` (`systemId`,`moduleId`),
  KEY `system_modules_systemId_idx` (`systemId`),
  KEY `system_modules_moduleId_idx` (`moduleId`),
  CONSTRAINT `system_modules_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `system_modules_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_modules`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `system_modules` WRITE;
/*!40000 ALTER TABLE `system_modules` DISABLE KEYS */;
INSERT INTO `system_modules` VALUES
(29,155,2);
/*!40000 ALTER TABLE `system_modules` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `system_people`
--

DROP TABLE IF EXISTS `system_people`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_people` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `systemId` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `role` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `system_people_systemId_idx` (`systemId`),
  CONSTRAINT `system_people_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_people`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `system_people` WRITE;
/*!40000 ALTER TABLE `system_people` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_people` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `system_ports`
--

DROP TABLE IF EXISTS `system_ports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_ports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `systemId` int(11) NOT NULL,
  `unlocodeId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_ports_systemId_unlocodeId_key` (`systemId`,`unlocodeId`),
  KEY `system_ports_unlocodeId_idx` (`unlocodeId`),
  CONSTRAINT `system_ports_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `system_ports_unlocodeId_fkey` FOREIGN KEY (`unlocodeId`) REFERENCES `un_locodes` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_ports`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `system_ports` WRITE;
/*!40000 ALTER TABLE `system_ports` DISABLE KEYS */;
INSERT INTO `system_ports` VALUES
(81,155,41),
(71,156,42),
(72,156,43),
(73,156,44),
(74,156,45),
(75,156,46),
(76,156,47),
(77,156,48),
(78,157,49),
(79,158,61);
/*!40000 ALTER TABLE `system_ports` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `system_sub_systems`
--

DROP TABLE IF EXISTS `system_sub_systems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_sub_systems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `systemId` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `system_sub_systems_systemId_idx` (`systemId`),
  CONSTRAINT `system_sub_systems_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_sub_systems`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `system_sub_systems` WRITE;
/*!40000 ALTER TABLE `system_sub_systems` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_sub_systems` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `system_tag_assignments`
--

DROP TABLE IF EXISTS `system_tag_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_tag_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `systemId` int(11) NOT NULL,
  `tagId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_tag_assignments_systemId_tagId_key` (`systemId`,`tagId`),
  KEY `system_tag_assignments_tagId_idx` (`tagId`),
  CONSTRAINT `system_tag_assignments_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `system_tag_assignments_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_tag_assignments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `system_tag_assignments` WRITE;
/*!40000 ALTER TABLE `system_tag_assignments` DISABLE KEYS */;
INSERT INTO `system_tag_assignments` VALUES
(9,155,4),
(5,156,4),
(6,157,4),
(7,158,4);
/*!40000 ALTER TABLE `system_tag_assignments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `system_urls`
--

DROP TABLE IF EXISTS `system_urls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_urls` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `systemId` int(11) NOT NULL,
  `urlTypeId` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `system_urls_systemId_idx` (`systemId`),
  KEY `system_urls_urlTypeId_idx` (`urlTypeId`),
  CONSTRAINT `system_urls_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `system_urls_urlTypeId_fkey` FOREIGN KEY (`urlTypeId`) REFERENCES `url_types` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_urls`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `system_urls` WRITE;
/*!40000 ALTER TABLE `system_urls` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_urls` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `systems`
--

DROP TABLE IF EXISTS `systems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `systems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `scope` text NOT NULL,
  `projectType` enum('PMIS','VTS','AIS','COASTAL','PILOT','OTHER') NOT NULL,
  `products` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `customerDetails` text DEFAULT NULL,
  `endUserDetails` text DEFAULT NULL,
  `countryId` int(11) NOT NULL,
  `systemUnlocodeId` int(11) NOT NULL,
  `pocName` varchar(150) DEFAULT NULL,
  `pocEmail` varchar(150) DEFAULT NULL,
  `pocPhone` varchar(50) DEFAULT NULL,
  `isSensitive` tinyint(1) NOT NULL DEFAULT 0,
  `canBeUsedAsReference` tinyint(1) NOT NULL DEFAULT 0,
  `systemDecommissioned` tinyint(1) NOT NULL DEFAULT 0,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `internalNotes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `systems_countryId_idx` (`countryId`),
  KEY `systems_systemUnlocodeId_idx` (`systemUnlocodeId`),
  KEY `systems_projectType_idx` (`projectType`),
  KEY `systems_canBeUsedAsReference_idx` (`canBeUsedAsReference`),
  KEY `systems_deleted_idx` (`deleted`),
  CONSTRAINT `systems_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `systems_systemUnlocodeId_fkey` FOREIGN KEY (`systemUnlocodeId`) REFERENCES `un_locodes` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=166 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `systems`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `systems` WRITE;
/*!40000 ALTER TABLE `systems` DISABLE KEYS */;
INSERT INTO `systems` VALUES
(155,'Darwin','please add','PMIS','Port Control',NULL,'Darwin Port Operations Pty Ltd','Darwin Port Operations Pty Ltd',14,41,NULL,NULL,NULL,0,1,0,0,'2026-09-10 17:15:49.410','2026-09-11 14:41:49.237',NULL),
(156,'Flinders, FPH','to be added','PMIS','PortControl',NULL,NULL,NULL,14,42,NULL,NULL,NULL,0,1,0,0,'2026-09-10 17:21:18.525','2026-09-10 17:21:18.525',NULL),
(157,'Fremantle','to be added','PMIS','PortControl',NULL,'Fremantle Port Authority','Fremantle Port Authority',14,49,NULL,NULL,NULL,0,1,0,0,'2026-09-10 17:22:54.185','2026-09-10 17:22:54.185',NULL),
(158,'Gladstone Pilots','to be added','PILOT','Pilot Control',NULL,NULL,NULL,14,61,NULL,NULL,NULL,0,1,0,0,'2026-09-10 17:24:10.968','2026-09-10 17:24:10.968',NULL);
/*!40000 ALTER TABLE `systems` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `backgroundColor` varchar(7) NOT NULL,
  `textColor` varchar(7) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES
(4,'AMERICAS','Tidalis Americas','#4B99EC','#FFFFFF'),
(5,'EMEA','Tidalis EMEA','#0CDF0F','#0D0D0D'),
(8,'ASIA','Tidalis Asia','#FDAC4E','#000000');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `un_locodes`
--

DROP TABLE IF EXISTS `un_locodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `un_locodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(5) NOT NULL,
  `name` varchar(150) NOT NULL,
  `countryId` int(11) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `un_locodes_code_key` (`code`),
  KEY `un_locodes_countryId_idx` (`countryId`),
  KEY `un_locodes_name_idx` (`name`),
  CONSTRAINT `un_locodes_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `un_locodes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `un_locodes` WRITE;
/*!40000 ALTER TABLE `un_locodes` DISABLE KEYS */;
INSERT INTO `un_locodes` VALUES
(1,'NLRTM','Rotterdam',157,51.9225,4.47917),
(2,'NLAMS','Amsterdam',157,52.3728,4.89361),
(3,'NLIJM','IJmuiden',157,52.4583,4.61028),
(4,'BEANR','Antwerpen',22,51.2194,4.4025),
(5,'BEZEE','Zeebrugge',22,51.3306,3.20833),
(6,'DEHAM','Hamburg',84,53.5511,9.99361),
(7,'DEBRV','Bremerhaven',84,53.5396,8.58083),
(8,'GBLON','London',235,51.5074,-0.1278),
(9,'GBSOU','Southampton',235,50.9097,-1.4043),
(10,'FRLEH','Le Havre',77,49.4944,0.1079),
(11,'FRMRS','Marseille',77,43.2965,5.36978),
(12,'ESALG','Algeciras',210,36.1408,-5.4564),
(13,'ESBCN','Barcelona',210,41.3851,2.1734),
(14,'ITGOA','Genova',111,44.4056,8.9463),
(15,'NOOSL','Oslo',167,59.9139,10.7522),
(16,'SEGOT','Göteborg',215,57.7089,11.9746),
(17,'DKCPH','København',61,55.6761,12.5683),
(18,'PLGDN','Gdansk',178,54.352,18.6466),
(19,'USNYC','New York',236,40.7128,-74.006),
(20,'USLAX','Los Angeles',236,33.7406,-118.2711),
(21,'USHOU','Houston',236,29.7604,-95.3698),
(22,'CAVAN','Vancouver',41,49.2827,-123.1207),
(23,'PAPTY','Panama City',172,8.9824,-79.5199),
(24,'BRSSZ','Santos',32,-23.9608,-46.3336),
(25,'SGSIN','Singapore',201,1.2905,103.852),
(26,'CNSHA','Shanghai',46,31.2304,121.4737),
(27,'CNNGB','Ningbo',46,29.8683,121.544),
(28,'HKHKG','Hong Kong',101,22.3193,114.1694),
(29,'KRPUS','Busan',120,35.1796,129.0756),
(30,'JPTYO','Tokyo',113,35.6528,139.8395),
(31,'MYPKG','Port Klang',135,3,101.39),
(32,'AEDXB','Dubai',234,25.2697,55.3095),
(33,'AEJEA','Jebel Ali',234,25.0111,55.0617),
(34,'SAJED','Jeddah',196,21.4858,39.1925),
(35,'QADOH','Doha',181,25.2854,51.531),
(36,'EGPSD','Port Said',66,31.2653,32.3019),
(37,'ZADUR','Durban',207,-29.8587,31.0218),
(38,'AUSYD','Sydney',14,-33.8568,151.2153),
(39,'AUMEL','Melbourne',14,-37.8136,144.9631),
(40,'NZAKL','Auckland',159,-36.8485,174.7633),
(41,'AUDRW','Darwin',14,-12.45,130.8333),
(42,'AUADL','Adelaide',14,-34.9167,138.5833),
(43,'AUTHE','Thevenard',14,-32.1457473,133.6540362),
(44,'AUKLP','Klein Point',14,-35.033,137.612),
(45,'AUPGI','Port Giles',14,-35.0219216,137.7619583),
(46,'AUPLO','Port Lincoln',14,-34.7211905,135.8592218),
(47,'AUPPI','Port Pirie',14,-33.1791249,138.0058614),
(48,'AUWAL','Wallaroo',14,-33.9308118,137.6272608),
(49,'AUFRE','Fremantle',14,-32.0534086,115.7586172),
(50,'DKAAR','Aarhus',61,56.1496278,10.2134046),
(51,'AUPHE','Port Hedland',14,-20.3167,118.5667),
(52,'AUASB','Ashburton',14,-21.6833,115),
(53,'AUDAM','Dampier',14,-20.6636,116.715),
(54,'AUBNE','Brisbane',14,-27.4667,153.0167),
(55,'AUABP','Abbot Point',14,-19.9,148.0833),
(56,'AUBDB','Bundaberg',14,-24.7597,152.4067),
(57,'AUBUC','Burketown',14,-17.7333,139.5333),
(58,'AUCNS','Cairns',14,-16.9186,145.7781),
(59,'AUCQP','Cape Flattery',14,-14.9667,145.3333),
(60,'AUCTN','Cooktown',14,-15.4667,145.25),
(61,'AUGLT','Gladstone',14,-23.8489,151.25),
(62,'AUHPT','Hay Point',14,-21.2833,149.2833),
(63,'AUKRB','Karumba',14,-17.4833,140.8333),
(64,'AULUC','Lucinda',14,-18.5167,146.3833),
(65,'AUMKY','Mackay',14,-21.15,149.2),
(66,'AUMBH','Maryborough',14,-25.5333,152.7),
(67,'AUMOU','Mourilyan',14,-17.6,146.1167),
(68,'AUPKN','Port Kennedy',14,-10.5833,142.2167),
(69,'AUROK','Rockhampton',14,-23.3818,150.51),
(70,'AUSKA','Skardon River',14,-11.75,142.0167),
(71,'AUTSV','Townsville',14,-19.259,146.8169),
(72,'AUWEI','Weipa',14,-12.6333,141.8667),
(73,'AUPAU','Port Arthur',14,-43.15,147.85),
(74,'AUBEL','Bell Bay',14,-41.1333,146.8833),
(75,'AUBWT','Burnie',14,-41.0558,145.9078),
(76,'AUDPO','Devonport',14,-41.1833,146.35),
(77,'AUFLS','Flinders Island',14,-40.1167,148),
(78,'AUHBA','Hobart',14,-42.8667,147.3),
(79,'AUKNS','King Is',14,-39.8667,143.8833),
(80,'AUPLA','Port Latta',14,-40.8667,145.4167),
(81,'AUSPB','Spring Bay',14,-42.55,147.9333),
(82,'AUSTA','Stanley',14,-40.7667,145.3),
(83,'AUSRN','Strahan',14,-42.15,145.3333),
(84,'VGTOV','Tortola',243,18.4307,-64.6151),
(85,'VGVIJ','Virgin Gorda',243,18.4508,-64.4374),
(86,'CACWL','Cornwall',41,45.0219,-74.7332),
(87,'CAHAL','Halifax',41,44.6488,-63.5752),
(88,'CAMTR','Montreal',41,45.5017,-73.5673),
(89,'CASJB','Saint-John',41,45.2667,-66.0667),
(90,'CAPRR','Prince Rupert',41,54.315,-130.3208),
(91,'CWWIL','Willemstad',58,12.1,-68.9167),
(92,'IEDUB','Dublin',108,53.3498,-6.2603),
(93,'NZLYT','Lyttelton',159,-43.6,172.7167),
(94,'OMSOH','Sohar',168,24.3487,56.7386),
(95,'PGATP','Aitape',173,-3.1367,142.3489),
(96,'PGGUR','Alotau',173,-10.3167,150.4333),
(97,'PGBUA','Buka',173,-5.4231,154.6742),
(98,'PGDAU','Daru',173,-9.0833,143.2083),
(99,'PGKVG','Kavieng',173,-2.5744,150.7967),
(100,'PGKIE','Kieta',173,-6.2186,155.6353),
(101,'PGKIM','Kimbe',173,-5.55,150.15),
(102,'PGLAE','Lae',173,-6.7333,146.9833),
(103,'PGLOR','Lorengau, Manus Island',173,-2.0167,147.2667),
(104,'PGMAG','Madang',173,-5.2167,145.7833),
(105,'PGROR','Orobay',173,-8.9333,148.4667),
(106,'PGPOM','Port Moresby',173,-9.4438,147.1803),
(107,'PGRAB','Rabaul',173,-4.2,152.1667),
(108,'PGVAI','Vanimo',173,-2.6833,141.3),
(109,'PGWWK','Wewak',173,-3.55,143.6333),
(110,'PRSJU','San Juan',180,18.45,-66.0833),
(111,'TTPOS','Port-of-Spain',226,10.65,-61.5167),
(112,'GBBEL','Belfast',235,54.9833,-5.9167),
(113,'GBGRG','Grangemouth',235,56,-3.7167),
(114,'GBBTL','Burntisland',235,56.0667,-3.2333),
(115,'GBDUN','Dundee',235,56.5,-2.9667),
(116,'GBKKD','Kirkcaldy',235,56.1167,-3.15),
(117,'GBLEI','Leith',235,55.95,-3.1667),
(118,'GBMTH','Methil',235,56.1833,-3.0167),
(119,'GBROY','Rosyth',235,56.0333,-3.4333),
(120,'GBTIL','Tilbury',235,51.459,0.361),
(121,'USAST','Astoria',236,46.1879,-123.8313),
(122,'USHNL','Honolulu',236,21.3,-157.85),
(123,'USPGL','Pascagoula',236,30.3658,-88.5561),
(124,'USJAX','Jacksonville',236,30.3322,-81.6557),
(125,'USBAL','Baltimore',236,39.2833,-76.6167),
(126,'USPVD','Providence',236,41.824,-71.4128),
(127,'USFLL','Fort Lauderdale',236,26.1167,-80.1333),
(128,'USBRO','Brownsville',236,25.9,-97.4833),
(129,'USCRP','Corpus Christi',236,27.8006,-97.3964),
(130,'USNTD','Port Hueneme',236,34.1333,-119.1833),
(131,'USSAN','San Diego',236,32.7,-117.15),
(132,'USBNB','Burns Harbor',236,41.6167,-87.1333),
(133,'USZJ9','Jeffersonville',236,38.2779,-85.7444),
(134,'USMXH','Mount Vernon',236,37.9167,-87.8833),
(135,'USPMT','Palmetto',236,27.5211,-82.5729),
(136,'USSCK','Stockton',236,37.95,-121.2833),
(137,'AUCLT','Port of Anketell',14,-20.65,117.05),
(138,'NLVLI','Vlissingen',157,51.45,3.7),
(139,'GBTYN','Tyne',235,55,-1.4333),
(140,'GBLIV','Liverpool',235,53.4167,-3),
(141,'CNFZH','Fuzhou',46,26.0833,119.3),
(142,'IDTPP','Tanjung Priok',105,-6.1,106.8833),
(143,'MOMFM','Macau',132,22.2,113.5333),
(144,'LTKLJ','Klaipeda',130,55.7167,21.15),
(145,'VNHPH','Haiphong',242,20.8648,106.6838),
(146,'BDCGP','Chittagong',19,22.3569,91.7832),
(147,'NLNIJ','Nijmegen',157,51.8425,5.8528),
(148,'NLWBD','Wijk bij Duurstede',157,51.9747,5.3639),
(149,'CNZOS','Zhoushan',46,29.9853,122.2072),
(150,'EETLL','Tallinn',70,59.4333,24.7333),
(151,'AEFJR','Fujairah',234,25.1288,56.3265),
(152,'CNJMN','Jiangmen',46,22.5833,113.0667),
(153,'BDMGL','Mongla',19,22.4791,89.6041),
(154,'FRSNR','Saint-Nazaire',77,47.2833,-2.2),
(155,'OMDQM','Duqm',168,19.65,57.7),
(156,'HRSPU','Split',56,43.5,16.45),
(157,'NLDHR','Den Helder',157,52.95,4.7667),
(158,'THBKK','Bangkok',221,13.75,100.5167),
(159,'SARTA','Ras Tanura',196,26.6333,50.15),
(160,'PTLIS','Lisboa',179,38.7167,-9.1333),
(161,'INBOM','Mumbai',104,18.9667,72.8167),
(162,'PLSZZ','Szczecin',178,53.4285,14.5528),
(163,'ROCND','Constanta',183,44.1833,28.65),
(164,'AUPWF','Port Wakefield',14,-34.1667,138.1667),
(165,'CMKBI','Kribi',40,2.95,9.9095),
(166,'AEDBP','Dibba',234,25.6167,56.2667);
/*!40000 ALTER TABLE `un_locodes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `url_types`
--

DROP TABLE IF EXISTS `url_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `url_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `url_types_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `url_types`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `url_types` WRITE;
/*!40000 ALTER TABLE `url_types` DISABLE KEYS */;
INSERT INTO `url_types` VALUES
(1,'Pipedrive'),
(4,'Project'),
(3,'Support'),
(2,'System');
/*!40000 ALTER TABLE `url_types` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `lastLoginAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'dev@tidalis.com','local user','2026-09-04 20:23:35.120','2026-09-11 18:35:36.892');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-12 16:27:57
