<script lang="ts">
	type Team = {
		abbreviation: string;
		name: string;
		city: string;
		colorPrimary: string | null;
		colorSecondary: string | null;
	};

	type Player = {
		name: string;
		position: string;
		jersey: string | null;
		headshotUrl: string | null;
		status: string;
	};

	type PlayerStats = {
		season: number;
		seasonType: string;
		passYards: number;
		passTds: number;
		interceptionsThrown: number;
		rushYards: number;
		rushTds: number;
		receptions: number;
		recYards: number;
		recTds: number;
		tackles: number;
		sacks: string;
		interceptions: number;
		forcedFumbles: number;
		passDeflections: number;
		fgMade: number;
		fgAttempted: number;
		puntAvg: string;
		returnTds: number;
		gamesPlayed: number;
	};

	let {
		data
	}: {
		data: {
			team: Team;
			player: Player;
			stats: PlayerStats | undefined;
			activeSeason: number;
			activeSeasonType: string;
		};
	} = $props();

	const statCards = $derived.by(() => {
		const stats = data.stats;
		if (!stats) return [];

		const position = data.player.position;
		const cards = [{ label: 'Games', value: stats.gamesPlayed.toLocaleString() }];

		if (position === 'QB') {
			cards.push(
				{ label: 'Pass Yards', value: stats.passYards.toLocaleString() },
				{ label: 'Pass TD', value: stats.passTds.toLocaleString() },
				{ label: 'INT Thrown', value: stats.interceptionsThrown.toLocaleString() },
				{ label: 'Rush Yards', value: stats.rushYards.toLocaleString() },
				{ label: 'Rush TD', value: stats.rushTds.toLocaleString() }
			);
		} else if (['RB', 'FB'].includes(position)) {
			cards.push(
				{ label: 'Rush Yards', value: stats.rushYards.toLocaleString() },
				{ label: 'Rush TD', value: stats.rushTds.toLocaleString() },
				{ label: 'Receptions', value: stats.receptions.toLocaleString() },
				{ label: 'Rec Yards', value: stats.recYards.toLocaleString() }
			);
		} else if (['WR', 'TE'].includes(position)) {
			cards.push(
				{ label: 'Receptions', value: stats.receptions.toLocaleString() },
				{ label: 'Rec Yards', value: stats.recYards.toLocaleString() },
				{ label: 'Rec TD', value: stats.recTds.toLocaleString() },
				{ label: 'Rush Yards', value: stats.rushYards.toLocaleString() }
			);
		} else if (['K', 'PK'].includes(position)) {
			cards.push(
				{ label: 'FG Made', value: stats.fgMade.toLocaleString() },
				{ label: 'FG Attempts', value: stats.fgAttempted.toLocaleString() }
			);
		} else if (position === 'P') {
			cards.push({ label: 'Punt Avg', value: stats.puntAvg });
		} else {
			cards.push(
				{ label: 'Tackles', value: stats.tackles.toLocaleString() },
				{ label: 'Sacks', value: stats.sacks },
				{ label: 'Interceptions', value: stats.interceptions.toLocaleString() },
				{ label: 'Forced Fumbles', value: stats.forcedFumbles.toLocaleString() },
				{ label: 'Pass Deflections', value: stats.passDeflections.toLocaleString() }
			);
		}

		return cards.filter(
			(card, index) => index === 0 || (card.value !== '0' && card.value !== '0.0')
		);
	});
</script>

<svelte:head>
	<title>{data.player.name} | {data.team.abbreviation} | GridIron</title>
</svelte:head>

<main
	class="min-h-screen bg-[#0d0f14] text-[#f0f2f5]"
	style={`--team-primary: ${data.team.colorPrimary ?? '#f5a623'}; --team-secondary: ${data.team.colorSecondary ?? '#8a909e'};`}
>
	<header class="border-b border-white/10 bg-[#11151d]">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
			<a
				href={`/teams/${data.team.abbreviation.toLowerCase()}`}
				class="text-sm font-black tracking-widest text-[#8a909e] uppercase transition hover:text-white"
			>
				Back to {data.team.abbreviation}
			</a>
			<div class="text-sm font-black tracking-widest text-[#f5a623] uppercase">Player Detail</div>
		</div>
	</header>

	<section class="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[auto_1fr] md:items-center">
		<div
			class="flex h-44 w-44 items-center justify-center overflow-hidden border border-white/10 bg-white"
		>
			{#if data.player.headshotUrl}
				<img class="h-full w-full object-cover" src={data.player.headshotUrl} alt="" />
			{:else}
				<span class="text-3xl font-black text-[#11151d]">{data.player.position}</span>
			{/if}
		</div>

		<div>
			<div class="mb-3 flex flex-wrap gap-2">
				<span
					class="border border-white/10 bg-[#161921] px-3 py-1 text-xs font-black tracking-widest text-[var(--team-secondary)] uppercase"
				>
					{data.team.city}
					{data.team.name}
				</span>
				<span
					class="border border-white/10 bg-[#161921] px-3 py-1 text-xs font-black tracking-widest text-[#8a909e] uppercase"
				>
					{data.player.position}{data.player.jersey ? ` #${data.player.jersey}` : ''}
				</span>
			</div>
			<h1 class="text-4xl font-black md:text-6xl">{data.player.name}</h1>
			<div class="mt-5 h-2 max-w-sm bg-[var(--team-primary)]"></div>
			<div class="mt-5 text-sm font-bold text-[#8a909e] capitalize">
				Status: {data.player.status}
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-7xl px-4 pb-12">
		<div class="border border-white/10 bg-[#161921] p-5">
			<div class="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-end">
				<div>
					<h2 class="text-sm font-black tracking-widest text-[#f5a623] uppercase">Season Stats</h2>
					<p class="mt-1 text-sm text-[#8a909e]">
						{data.stats
							? `${data.stats.season} ${data.stats.seasonType} totals from ESPN`
							: `No synced ${data.activeSeason} ${data.activeSeasonType} stat row found for this player yet.`}
					</p>
				</div>
			</div>

			{#if statCards.length > 0}
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{#each statCards as stat}
						<div class="border border-white/10 bg-[#0d0f14] p-4">
							<div class="text-3xl font-black text-white">{stat.value}</div>
							<div class="mt-2 text-xs font-black tracking-widest text-[#8a909e] uppercase">
								{stat.label}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="border border-dashed border-white/15 bg-[#0d0f14] p-8 text-center">
					<div class="text-sm font-bold text-[#aeb4c0]">
						Stats have not been synced for this player.
					</div>
					<div class="mt-2 text-xs text-[#8a909e]">
						Run `npm run sync:stats` after roster sync for {data.activeSeason}.
					</div>
				</div>
			{/if}
		</div>
	</section>
</main>
