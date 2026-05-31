<script lang="ts">
	type Team = {
		abbreviation: string;
		name: string;
		city: string;
		conference: string;
		division: string;
		colorPrimary: string | null;
		colorSecondary: string | null;
		logoUrl: string | null;
	};

	type Player = {
		id: number;
		name: string;
		position: string;
		jersey: string | null;
		headshotUrl: string | null;
		status: string;
	};

	type RosterGroups = {
		offense: Player[];
		defense: Player[];
		specialTeams: Player[];
		other: Player[];
	};

	type Game = {
		id: string;
		homeTeam: string;
		awayTeam: string;
		homeScore: number | null;
		awayScore: number | null;
		status: string;
		gameTime: string | Date | null;
		week: number | null;
		season: number | null;
		broadcast: string | null;
	};

	type TeamRecord = {
		wins: number;
		losses: number;
		ties: number;
	};

	type StatLeader = {
		key: string;
		label: string;
		suffix: string;
		value: number | string;
		player: {
			id: number;
			name: string;
			position: string;
			jersey: string | null;
			headshotUrl: string | null;
		};
	};

	let {
		data
	}: {
		data: {
			team: Team;
			activeSeason: number;
			activeSeasonType: string;
			roster: RosterGroups;
			playerCount: number;
			schedule: Game[];
			record: TeamRecord;
			statLeaders: StatLeader[];
			role: string;
			topPlayers: Record<
				string,
				{
					value: number | string;
					player: {
						id: number;
						name: string;
						position: string;
						jersey: string | null;
						headshotUrl: string | null;
					};
				}[]
			>;
		};
	} = $props();
	const team = $derived(data.team);
	let activeRosterTab = $state<keyof RosterGroups>('offense');
	let positionFilter = $state('all');
	let scheduleFilter = $state('all');

	const seasonOptions = [2025, 2026, 2027, 2028];
	const seasonTypes = [
		{ value: 'regular', label: 'Regular' },
		{ value: 'postseason', label: 'Postseason' },
		{ value: 'preseason', label: 'Preseason' }
	];
	const rosterTabs: { key: keyof RosterGroups; label: string }[] = [
		{ key: 'offense', label: 'Offense' },
		{ key: 'defense', label: 'Defense' },
		{ key: 'specialTeams', label: 'Special Teams' },
		{ key: 'other', label: 'Other' }
	];

	const activePlayers = $derived(data.roster[activeRosterTab]);
	const filteredPlayers = $derived(
		positionFilter === 'all'
			? activePlayers
			: activePlayers.filter((player) => player.position === positionFilter)
	);
	const positionOptions = $derived([
		'all',
		...Array.from(new Set(activePlayers.map((player) => player.position))).sort()
	]);
	const filteredSchedule = $derived(
		scheduleFilter === 'all'
			? data.schedule
			: data.schedule.filter((game) => game.status === scheduleFilter)
	);
	const teamTopBlocks = $derived([
		{ label: 'Top Passers', suffix: 'yds', rows: data.topPlayers.passing },
		{ label: 'Top Rushers', suffix: 'yds', rows: data.topPlayers.rushing },
		{ label: 'Top Receivers', suffix: 'yds', rows: data.topPlayers.receiving },
		{ label: 'Top Tacklers', suffix: 'tkl', rows: data.topPlayers.tackles }
	]);

	function opponent(game: Game) {
		return game.homeTeam === team.abbreviation ? game.awayTeam : game.homeTeam;
	}

	function homeAway(game: Game) {
		return game.homeTeam === team.abbreviation ? 'vs' : '@';
	}

	function result(game: Game) {
		if (game.status !== 'closed' || game.homeScore === null || game.awayScore === null)
			return game.status;

		const isHome = game.homeTeam === team.abbreviation;
		const teamScore = isHome ? game.homeScore : game.awayScore;
		const opponentScore = isHome ? game.awayScore : game.homeScore;

		if (teamScore === opponentScore) return 'T';
		return teamScore > opponentScore ? 'W' : 'L';
	}

	function score(game: Game) {
		if (game.homeScore === null || game.awayScore === null) return 'TBD';
		const isHome = game.homeTeam === team.abbreviation;
		const teamScore = isHome ? game.homeScore : game.awayScore;
		const opponentScore = isHome ? game.awayScore : game.homeScore;
		return `${teamScore}-${opponentScore}`;
	}

	function gameDate(game: Game) {
		if (!game.gameTime) return 'TBD';
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(new Date(game.gameTime));
	}

	function resultClass(game: Game) {
		const gameResult = result(game);
		if (gameResult === 'W') return 'bg-green-500/15 text-green-300';
		if (gameResult === 'L') return 'bg-red-500/15 text-red-300';
		if (gameResult === 'T') return 'bg-yellow-500/15 text-yellow-200';
		if (gameResult === 'inprogress') return 'bg-[#f5a623]/15 text-[#f5a623]';
		return 'bg-white/5 text-[#8a909e]';
	}

	function leaderValue(leader: StatLeader) {
		const value = typeof leader.value === 'number' ? leader.value.toLocaleString() : leader.value;
		return `${value} ${leader.suffix}`;
	}

	function playerHref(playerId: number) {
		const params = new URLSearchParams({
			season: String(data.activeSeason),
			type: data.activeSeasonType
		});
		return `/teams/${team.abbreviation.toLowerCase()}/players/${playerId}?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>{team.city} {team.name} | GridIron</title>
	<meta
		name="description"
		content={`${team.city} ${team.name} roster, schedule, record, and synced ${data.activeSeason} ${data.activeSeasonType} team leaders on GridIron.`}
	/>
</svelte:head>

<main
	class="min-h-screen bg-[#0d0f14] text-[#f0f2f5]"
	style={`--team-primary: ${team.colorPrimary ?? '#f5a623'}; --team-secondary: ${team.colorSecondary ?? '#8a909e'};`}
>
	<header class="border-b border-white/10 bg-[#11151d]">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
			<a
				href="/"
				class="text-sm font-black tracking-widest text-[#8a909e] uppercase transition hover:text-white"
			>
				Back to teams
			</a>
			<nav class="flex items-center gap-5 text-sm font-black tracking-widest uppercase">
				<a class="text-[#8a909e] transition hover:text-white" href="/players">Players</a>
				<a class="text-[#8a909e] transition hover:text-white" href="/leaders">Leaders</a>
				<span class="text-[#f5a623]">{team.abbreviation}</span>
			</nav>
		</div>
	</header>

	<section class="border-b border-white/10 bg-[#161921]">
		<div class="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[auto_1fr] md:items-center">
			<div class="flex h-36 w-36 items-center justify-center border border-white/10 bg-white p-5">
				{#if team.logoUrl}
					<img class="max-h-full max-w-full object-contain" src={team.logoUrl} alt="" />
				{:else}
					<span class="text-2xl font-black text-[#11151d]">{team.abbreviation}</span>
				{/if}
			</div>

			<div>
				<div class="mb-3 flex flex-wrap gap-2">
					<span
						class="border border-white/10 bg-[#0d0f14] px-3 py-1 text-xs font-black tracking-widest text-[var(--team-secondary)] uppercase"
					>
						{team.conference}
					</span>
					<span
						class="border border-white/10 bg-[#0d0f14] px-3 py-1 text-xs font-black tracking-widest text-[#8a909e] uppercase"
					>
						{team.division}
					</span>
				</div>
				<h1 class="text-4xl font-black md:text-6xl">{team.city} {team.name}</h1>
				<div class="mt-5 h-2 max-w-sm bg-[var(--team-primary)]"></div>
				<div class="mt-5 text-sm font-bold tracking-widest text-[#8a909e] uppercase">
					{data.record.wins}-{data.record.losses}{data.record.ties ? `-${data.record.ties}` : ''} record
					<span class="mx-2 text-white/20">/</span>
					{data.playerCount} roster players synced
				</div>
				<form class="mt-6 grid max-w-lg gap-3 sm:grid-cols-[1fr_1fr_auto]" method="get">
					<select
						class="min-h-11 border-white/10 bg-[#0d0f14] text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
						name="season"
					>
						{#each seasonOptions as season}
							<option value={season} selected={season === data.activeSeason}>{season}</option>
						{/each}
					</select>
					<select
						class="min-h-11 border-white/10 bg-[#0d0f14] text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
						name="type"
					>
						{#each seasonTypes as type}
							<option value={type.value} selected={type.value === data.activeSeasonType}>
								{type.label}
							</option>
						{/each}
					</select>
					<button class="min-h-11 bg-[#f5a623] px-5 text-sm font-black text-[#11151d] uppercase">
						Apply
					</button>
				</form>
			</div>
		</div>
	</section>

	<section class="border-b border-white/10 bg-[#0d0f14]">
		<div class="mx-auto grid max-w-7xl gap-3 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
			<div class="border border-white/10 bg-[#161921] p-4">
				<div class="text-3xl font-black text-white">
					{data.record.wins}-{data.record.losses}{data.record.ties ? `-${data.record.ties}` : ''}
				</div>
				<div class="mt-1 text-xs font-black tracking-widest text-[#8a909e] uppercase">Record</div>
			</div>
			<div class="border border-white/10 bg-[#161921] p-4">
				<div class="text-3xl font-black text-white">{data.playerCount}</div>
				<div class="mt-1 text-xs font-black tracking-widest text-[#8a909e] uppercase">
					Roster Players
				</div>
			</div>
			<div class="border border-white/10 bg-[#161921] p-4">
				<div class="text-3xl font-black text-white">{data.schedule.length}</div>
				<div class="mt-1 text-xs font-black tracking-widest text-[#8a909e] uppercase">Games</div>
			</div>
			<div class="border border-white/10 bg-[#161921] p-4">
				<div class="text-3xl font-black text-white">{data.statLeaders.length}</div>
				<div class="mt-1 text-xs font-black tracking-widest text-[#8a909e] uppercase">
					Leader Categories
				</div>
			</div>
		</div>
	</section>

	<section class="border-b border-white/10 bg-[#0d0f14]">
		<div class="mx-auto max-w-7xl px-4 py-8">
			<div class="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-end">
				<div>
					<h2 class="text-sm font-black tracking-widest text-[#f5a623] uppercase">Team Leaders</h2>
					<p class="mt-1 text-sm text-[#8a909e]">
						{data.activeSeason}
						{data.activeSeasonType} leaders from synced player stats.
					</p>
				</div>
				<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">
					{data.statLeaders.length} categories
				</div>
			</div>

			{#if data.statLeaders.length === 0}
				<div class="border border-dashed border-white/15 bg-[#161921] p-8 text-center">
					<div class="text-sm font-bold text-[#aeb4c0]">No team stat leaders available yet.</div>
					<div class="mt-2 text-xs text-[#8a909e]">
						Stats are not synced for this selection.
						{#if data.role === 'admin'}
							<a class="font-black text-[#f5a623] hover:text-[#ffbd4a]" href="/admin/data-sync">
								Queue a stats sync.
							</a>
						{/if}
					</div>
				</div>
			{:else}
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
					{#each data.statLeaders as leader}
						<a
							href={playerHref(leader.player.id)}
							class="group border border-white/10 bg-[#161921] p-4 transition hover:-translate-y-0.5 hover:border-[#f5a623]/50"
						>
							<div class="mb-4 flex items-center justify-between gap-3">
								<div class="text-[10px] font-black tracking-widest text-[#8a909e] uppercase">
									{leader.label}
								</div>
								<div
									class="text-xs font-black tracking-widest text-[var(--team-secondary)] uppercase"
								>
									{leader.player.position}
								</div>
							</div>

							<div class="text-2xl font-black text-white">{leaderValue(leader)}</div>
							<div
								class="mt-2 truncate text-sm font-bold text-[#aeb4c0] group-hover:text-[#f5a623]"
							>
								{leader.player.name}{leader.player.jersey ? ` #${leader.player.jersey}` : ''}
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<section class="border-b border-white/10 bg-[#161921]">
		<div class="mx-auto max-w-7xl px-4 py-8">
			<div class="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-end">
				<div>
					<h2 class="text-sm font-black tracking-widest text-[#f5a623] uppercase">
						Top Five By Category
					</h2>
					<p class="mt-1 text-sm text-[#8a909e]">Team ranking depth for the selected season.</p>
				</div>
			</div>
			<div class="grid gap-4 lg:grid-cols-4">
				{#each teamTopBlocks as block}
					<article class="border border-white/10 bg-[#0d0f14] p-4">
						<h3 class="mb-3 text-xs font-black tracking-widest text-[#8a909e] uppercase">
							{block.label}
						</h3>
						{#if block.rows.length}
							<div class="space-y-2">
								{#each block.rows as row, index}
									<a
										href={playerHref(row.player.id)}
										class="flex items-center justify-between gap-3 border border-white/10 bg-[#161921] p-2 transition hover:border-[#f5a623]/50"
									>
										<div class="min-w-0">
											<div class="truncate text-sm font-black text-white">
												{index + 1}. {row.player.name}
											</div>
											<div class="text-xs text-[#8a909e]">{row.player.position}</div>
										</div>
										<div class="shrink-0 font-black text-[#f5a623]">
											{typeof row.value === 'number' ? row.value.toLocaleString() : row.value}
										</div>
									</a>
								{/each}
							</div>
						{:else}
							<div class="border border-dashed border-white/15 p-5 text-sm text-[#8a909e]">
								No synced data.
							</div>
						{/if}
					</article>
				{/each}
			</div>
		</div>
	</section>

	<section class="mx-auto grid max-w-7xl gap-5 px-4 py-10 lg:grid-cols-[0.85fr_1.65fr]">
		<div class="border border-white/10 bg-[#161921] p-5">
			<div class="mb-5 flex items-end justify-between gap-4">
				<div>
					<h2 class="text-sm font-black tracking-widest text-[#f5a623] uppercase">Schedule</h2>
					<p class="mt-1 text-sm text-[#8a909e]">
						{data.activeSeason}
						{data.activeSeasonType} season
					</p>
				</div>
				<div class="text-right text-xs font-black tracking-widest text-[#8a909e] uppercase">
					{filteredSchedule.length}/{data.schedule.length} games
				</div>
			</div>
			<div class="mb-4 grid grid-cols-2 gap-2">
				{#each ['all', 'scheduled', 'inprogress', 'closed'] as status}
					<button
						type="button"
						class={[
							'px-3 py-2 text-xs font-black tracking-wide uppercase transition',
							scheduleFilter === status
								? 'bg-[#f5a623] text-[#11151d]'
								: 'border border-white/10 text-[#8a909e] hover:text-white'
						]}
						onclick={() => (scheduleFilter = status)}
					>
						{status}
					</button>
				{/each}
			</div>

			{#if data.schedule.length === 0}
				<div class="border border-dashed border-white/15 bg-[#0d0f14] p-8 text-center">
					<div class="text-sm font-bold text-[#aeb4c0]">No schedule synced yet.</div>
					<div class="mt-2 text-xs text-[#8a909e]">
						Schedules are not synced for this season.
						{#if data.role === 'admin'}
							<a class="font-black text-[#f5a623] hover:text-[#ffbd4a]" href="/admin/data-sync">
								Queue a schedules sync.
							</a>
						{/if}
					</div>
				</div>
			{:else if filteredSchedule.length === 0}
				<div class="border border-dashed border-white/15 bg-[#0d0f14] p-8 text-center">
					<div class="text-sm font-bold text-[#aeb4c0]">No games match this filter.</div>
				</div>
			{:else}
				<div class="max-h-[640px] space-y-2 overflow-y-auto pr-1">
					{#each filteredSchedule as game}
						<div class="border border-white/10 bg-[#0d0f14] p-3">
							<div class="mb-2 flex items-center justify-between gap-3">
								<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">
									Week {game.week ?? '-'}
								</div>
								<div class={['px-2 py-1 text-xs font-black uppercase', resultClass(game)]}>
									{result(game)}
								</div>
							</div>

							<div class="flex items-center justify-between gap-3">
								<div class="min-w-0">
									<div class="text-lg font-black text-white">
										{homeAway(game)}
										{opponent(game)}
									</div>
									<div class="mt-1 text-xs text-[#8a909e]">
										{gameDate(game)}{game.broadcast ? ` / ${game.broadcast}` : ''}
									</div>
								</div>
								<div class="shrink-0 text-right text-2xl font-black text-white">
									{score(game)}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="border border-white/10 bg-[#161921] p-5">
			<div class="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h2 class="text-sm font-black tracking-widest text-[#f5a623] uppercase">Roster</h2>
					<p class="mt-1 text-sm text-[#8a909e]">Synced from ESPN public roster data.</p>
				</div>

				<div class="grid grid-cols-2 border border-white/10 bg-[#0d0f14] p-1 md:grid-cols-4">
					{#each rosterTabs as tab}
						<button
							type="button"
							class={[
								'px-3 py-2 text-xs font-black tracking-wide uppercase transition',
								activeRosterTab === tab.key
									? 'bg-[#f5a623] text-[#11151d]'
									: 'text-[#8a909e] hover:text-white'
							]}
							onclick={() => (activeRosterTab = tab.key)}
						>
							{tab.label}
						</button>
					{/each}
				</div>
			</div>
			<div class="mb-4">
				<select
					class="min-h-11 w-full border-white/10 bg-[#0d0f14] text-white focus:border-[#f5a623] focus:ring-[#f5a623] sm:w-48"
					bind:value={positionFilter}
				>
					{#each positionOptions as position}
						<option value={position}>{position === 'all' ? 'All Positions' : position}</option>
					{/each}
				</select>
			</div>

			{#if activePlayers.length === 0}
				<div class="border border-dashed border-white/15 bg-[#0d0f14] p-8 text-center">
					<div class="text-sm font-bold text-[#aeb4c0]">No players synced for this group yet.</div>
					<div class="mt-2 text-xs text-[#8a909e]">
						Rosters are not synced for this team.
						{#if data.role === 'admin'}
							<a class="font-black text-[#f5a623] hover:text-[#ffbd4a]" href="/admin/data-sync">
								Queue a rosters sync.
							</a>
						{/if}
					</div>
				</div>
			{:else}
				<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{#each filteredPlayers as player}
						<a
							href={playerHref(player.id)}
							class="group flex min-h-24 items-center gap-3 border border-white/10 bg-[#0d0f14] p-3 transition hover:border-[#f5a623]/50"
						>
							<div
								class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white"
							>
								{#if player.headshotUrl}
									<img class="h-full w-full object-cover" src={player.headshotUrl} alt="" />
								{:else}
									<span class="text-xs font-black text-[#11151d]">{player.position}</span>
								{/if}
							</div>
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<span
										class="text-xs font-black tracking-widest text-[var(--team-secondary)] uppercase"
									>
										{player.position}
									</span>
									{#if player.jersey}
										<span class="text-xs font-bold text-[#8a909e]">#{player.jersey}</span>
									{/if}
								</div>
								<div class="truncate text-base font-black text-white group-hover:text-[#f5a623]">
									{player.name}
								</div>
								<div class="mt-1 text-xs text-[#8a909e] capitalize">{player.status}</div>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</main>
