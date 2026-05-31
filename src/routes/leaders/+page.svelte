<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const seasonOptions = [2025, 2026, 2027, 2028];
	const seasonTypes = [
		{ value: 'regular', label: 'Regular' },
		{ value: 'postseason', label: 'Postseason' },
		{ value: 'preseason', label: 'Preseason' }
	];

	function valueLabel(value: number | string) {
		return typeof value === 'number' ? value.toLocaleString() : value;
	}

	function leaderHref(category: string, season = data.season, type = data.seasonType) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('category', category);
		params.set('season', String(season));
		params.set('type', type);
		return `/leaders?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>League Leaders | GridIron</title>
</svelte:head>

<main class="min-h-screen bg-[#0d0f14] text-[#f0f2f5]">
	<header class="border-b border-white/10 bg-[#11151d]">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
			<a href="/" class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded bg-[#f5a623] text-sm font-black text-[#11151d]"
				>
					NFL
				</div>
				<div>
					<div class="text-lg font-black tracking-wide uppercase">GridIron</div>
					<div class="text-xs tracking-widest text-[#8a909e] uppercase">League Leaders</div>
				</div>
			</a>

			<nav class="hidden items-center gap-6 text-sm font-semibold text-[#8a909e] md:flex">
				<a class="transition hover:text-white" href="/">Teams</a>
				<a class="transition hover:text-white" href="/players">Players</a>
				<a class="text-[#f5a623]" href="/leaders">Leaders</a>
				{#if data.role === 'admin'}
					<a class="transition hover:text-white" href="/admin/settings">Admin</a>
				{/if}
			</nav>
		</div>
	</header>

	<section class="border-b border-white/10 bg-[#161921]">
		<div class="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_auto] lg:items-end">
			<div>
				<h1 class="text-4xl font-black md:text-5xl">League Leaders</h1>
				<p class="mt-3 max-w-2xl text-sm leading-6 text-[#aeb4c0]">
					Top synced player totals by category, season, and season type.
				</p>
			</div>

			<form class="grid gap-3 sm:grid-cols-3" method="get">
				<input name="category" type="hidden" value={data.category} />
				<select
					class="min-h-12 border-white/10 bg-[#0d0f14] text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
					name="season"
				>
					{#each seasonOptions as season}
						<option value={season} selected={season === data.season}>{season}</option>
					{/each}
				</select>
				<select
					class="min-h-12 border-white/10 bg-[#0d0f14] text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
					name="type"
				>
					{#each seasonTypes as type}
						<option value={type.value} selected={type.value === data.seasonType}
							>{type.label}</option
						>
					{/each}
				</select>
				<button
					class="min-h-12 bg-[#f5a623] px-5 text-sm font-black tracking-wide text-[#11151d] uppercase transition hover:bg-[#ffbd4a]"
				>
					Apply
				</button>
			</form>
		</div>
	</section>

	<section class="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[17rem_1fr]">
		<aside class="border border-white/10 bg-[#161921] p-3 lg:sticky lg:top-4 lg:self-start">
			<div class="mb-2 px-2 text-xs font-black tracking-widest text-[#8a909e] uppercase">
				Categories
			</div>
			<div class="grid gap-1">
				{#each data.categories as category}
					<a
						href={leaderHref(category.key)}
						class={[
							'px-3 py-2 text-sm font-black transition',
							data.category === category.key
								? 'bg-[#f5a623] text-[#11151d]'
								: 'text-[#aeb4c0] hover:bg-[#0d0f14] hover:text-white'
						]}
					>
						{category.label}
					</a>
				{/each}
			</div>
		</aside>

		<div class="border border-white/10 bg-[#161921] p-5">
			<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
				<div>
					<h2 class="text-sm font-black tracking-widest text-[#f5a623] uppercase">
						{data.categoryLabel}
					</h2>
					<p class="mt-1 text-sm text-[#8a909e]">
						{data.season} <span class="capitalize">{data.seasonType}</span>
					</p>
				</div>
				<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">
					{data.rows.length} players
				</div>
			</div>

			{#if data.rows.length}
				<div class="overflow-x-auto">
					<table class="w-full min-w-[760px] text-left text-sm">
						<thead
							class="border-b border-white/10 text-xs font-black tracking-widest text-[#8a909e] uppercase"
						>
							<tr>
								<th class="py-3 pr-4">Rank</th>
								<th class="py-3 pr-4">Player</th>
								<th class="py-3 pr-4">Team</th>
								<th class="py-3 pr-4">Games</th>
								<th class="py-3 text-right">{data.categoryLabel}</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-white/10">
							{#each data.rows as row, index}
								<tr class="group">
									<td class="py-4 pr-4 text-2xl font-black text-[#f5a623]">{index + 1}</td>
									<td class="py-4 pr-4">
										<a
											class="flex items-center gap-3"
											href={`/teams/${row.team.abbreviation.toLowerCase()}/players/${row.player.id}`}
										>
											<div
												class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white"
											>
												{#if row.player.headshotUrl}
													<img
														class="h-full w-full object-cover"
														src={row.player.headshotUrl}
														alt=""
													/>
												{:else if row.team.logoUrl}
													<img
														class="max-h-full max-w-full object-contain p-2"
														src={row.team.logoUrl}
														alt=""
													/>
												{:else}
													<span class="text-xs font-black text-[#11151d]"
														>{row.player.position}</span
													>
												{/if}
											</div>
											<div class="min-w-0">
												<div class="truncate font-black text-white group-hover:text-[#f5a623]">
													{row.player.name}
												</div>
												<div class="text-xs text-[#8a909e]">
													{row.player.position}{row.player.jersey ? ` #${row.player.jersey}` : ''}
												</div>
											</div>
										</a>
									</td>
									<td class="py-4 pr-4">
										<a
											class="font-black text-[#c6cad3] transition hover:text-white"
											href={`/teams/${row.team.abbreviation.toLowerCase()}`}
										>
											{row.team.abbreviation}
										</a>
										<div class="text-xs text-[#8a909e]">{row.team.city} {row.team.name}</div>
									</td>
									<td class="py-4 pr-4 text-[#c6cad3]">{row.stats.gamesPlayed}</td>
									<td class="py-4 text-right text-2xl font-black text-white">
										{valueLabel(row.value)}
										<span class="ml-1 text-xs text-[#8a909e]">{data.suffix}</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="border border-dashed border-white/15 bg-[#0d0f14] p-10 text-center">
					<div class="text-sm font-bold text-[#aeb4c0]">No leaders found for this selection.</div>
				</div>
			{/if}
		</div>
	</section>
</main>
