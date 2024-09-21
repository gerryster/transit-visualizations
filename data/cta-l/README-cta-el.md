README-cta-el.md

This explains how to load CTA stop and ridership information into a SQLite database. It uses the following public data sources for [stops](https://data.cityofchicago.org/Transportation/CTA-System-Information-List-of-L-Stops/8pix-ypme/about_data) and [ridership](https://data.cityofchicago.org/Transportation/CTA-Ridership-L-Station-Entries-Daily-Totals/5neh-572f/about_data).  These two sources can be joined to the by using MAP_ID from stops to the station_id column in ridership.

Data import notes:

1. Create the database: `sqlite3 cta-l`
2. Import the stops temporary table: `csvsql --db sqlite:///cta-l.db --insert CTA_-_System_Information_-_List_of__L__Stops_20240714.csv`
3. Create the permanent stops table:

```sql
CREATE TABLE stops (
	id INTEGER PRIMARY KEY,
	map_id INTEGER NOT NULL,
	name VARCHAR NOT NULL,
	station_name VARCHAR NOT NULL,
	station_descriptive_name VARCHAR NOT NULL,
	direction CHAR(1) NOT NULL,
	ADA BOOLEAN NOT NULL,
	red BOOLEAN NOT NULL,
	blue BOOLEAN NOT NULL,
	green BOOLEAN NOT NULL,
	brown BOOLEAN NOT NULL,
	purple BOOLEAN NOT NULL,
	purple_express BOOLEAN NOT NULL,
	yellow BOOLEAN NOT NULL,
	pink BOOLEAN NOT NULL,
	orange BOOLEAN NOT NULL,
	Location VARCHAR NOT NULL
);

CREATE INDEX idx_map_id ON stops (map_id);
```

4. Import from the temporary to permanent stops table:

```sql
INSERT INTO stops (id, map_id, name, station_name, station_descriptive_name, direction, ADA, red, blue, green, brown, purple, purple_express, yellow, pink, orange, Location)
SELECT STOP_ID, MAP_ID, STOP_NAME, STATION_NAME, STATION_DESCRIPTIVE_NAME, DIRECTION_ID, ADA, RED, BLUE, G, BRN, P, Pexp, Y, Pnk, O, Location
FROM `CTA_-_System_Information_-_List_of__L__Stops_20240714`;
```

5. Remove the temporary stops table:

```sql
drop table `CTA_-_System_Information_-_List_of__L__Stops_20240714`;
```

6. Extract the ridership data: `gunzip CTA_-_Ridership_-__L__Station_Entries_-_Daily_Totals_20240713.csv.gz`.

Note that this file is about 9MB compressed and 42MZ uncompressed. It contains about 1.2 million records.

7. Import the stops temporary table: `csvsql --db sqlite:///cta-l.db --insert CTA_-_Ridership_-__L__Station_Entries_-_Daily_Totals_20240713.csv'.

8. Create the permanent daily_ridership table:

```sql
CREATE TABLE daily_ridership (
	map_id INTEGER NOT NULL,
	date DATE NOT NULL,
	day_type CHAR(1) NOT NULL,
	rides INTEGER NOT NULL
);

CREATE INDEX idx_daily_ridership_map_id ON daily_ridership (map_id);
CREATE INDEX idx_daily_ridership_date ON daily_ridership (date);
CREATE INDEX idx_daily_ridership_day_type ON daily_ridership (day_type);
```

9. Import from the temporary to permanent daily_ridership table:

```sql
INSERT INTO daily_ridership (map_id, date, day_type, rides)
SELECT station_id, date, daytype, rides
FROM `CTA_-_Ridership_-__L__Station_Entries_-_Daily_Totals_20240713`;
```

10. Verify that the import completed:

The two counts should be equal.

```sql
select count(*) from "CTA_-_Ridership_-__L__Station_Entries_-_Daily_Totals_20240713";
select count(*) from daily_ridership;
```

11. Remove the temporary stops table:

```sql
drop table `CTA_-_Ridership_-__L__Station_Entries_-_Daily_Totals_20240713`;
```

12. Create the stations table from the stops table:

```sql
CREATE TABLE stations AS
	SELECT
		map_id,
		group_concat(DISTINCT (station_name)) AS name,
		group_concat(DISTINCT (station_descriptive_name)) AS description,
		min(ADA) AS ADA,
		/* consider a station not ADA unless all parts of it are */
		max(red) AS red,
		max(blue) AS blue,
		max(green) AS green,
		max(brown) AS brown,
		max(purple) AS purple,
		max(purple_express) AS purple_express,
		max(yellow) AS yellow,
		max(pink) as pink,
		max(orange) AS orange,
		group_concat(DISTINCT (LOCATION)) AS LOCATION
	FROM
		stops
	GROUP BY
		map_id;
```

13. Optionally optimize the database file now that large tables have been dropped: `VACUUM;`.
