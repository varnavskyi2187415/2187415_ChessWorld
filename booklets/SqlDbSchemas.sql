
-- ROOM SERVICE
CREATE TABLE `attendee` (
                            `id` varchar(36) NOT NULL,
                            `userId` varchar(255) NOT NULL,
                            `isPlayer` tinyint NOT NULL,
                            `socketId` varchar(255) NOT NULL DEFAULT '',
                            `roomId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE `room` (
                        `id` varchar(36) NOT NULL,
                        `title` varchar(255) NOT NULL,
                        `whiteUserId` varchar(255) NOT NULL,
                        `blackUserId` varchar(255) NOT NULL,
                        `gamePGN` longtext NOT NULL,
                        `gameStatus` varchar(255) NOT NULL,
                        `stockfishDepth` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendee`
--
ALTER TABLE `attendee`
    ADD PRIMARY KEY (`id`),
  ADD KEY `FK_ed05c0ebf8e2f0184e6c849bd1c` (`roomId`);

--
-- Indexes for table `room`
--
ALTER TABLE `room`
    ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendee`
--
ALTER TABLE `attendee`
    ADD CONSTRAINT `FK_ed05c0ebf8e2f0184e6c849bd1c` FOREIGN KEY (`roomId`) REFERENCES `room` (`id`) ON DELETE CASCADE;
COMMIT;

--------------------------------------------------------------------------------------------------------
--
-- Database: `project`
--

-- --------------------------------------------------------

--
-- Table structure for table `token`
--

CREATE TABLE `token` (
                         `id` int NOT NULL,
                         `token` text NOT NULL,
                         `userId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
                        `id` varchar(36) NOT NULL,
                        `name` varchar(255) NOT NULL,
                        `email` varchar(255) NOT NULL,
                        `password` varchar(255) NOT NULL,
                        `roles` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for table `token`
--
ALTER TABLE `token`
    ADD PRIMARY KEY (`id`),
  ADD KEY `FK_94f168faad896c0786646fa3d4a` (`userId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
    ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`),
  ADD UNIQUE KEY `isUnique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `token`
--
ALTER TABLE `token`
    MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `token`
--
ALTER TABLE `token`
    ADD CONSTRAINT `FK_94f168faad896c0786646fa3d4a` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE;
COMMIT;