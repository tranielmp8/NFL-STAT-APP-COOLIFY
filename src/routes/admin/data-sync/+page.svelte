<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import type { PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const activeSeason = $derived(data.settings.currentSeason);
	const activeSeasonType = $derived(data.settings.currentSeasonType);
	const jobTypes = [
		{ value: 'full', label: 'Full Sync' },
		{ value: 'teams', label: 'Teams' },
		{ value: 'rosters', label: 'Rosters' },
		{ value: 'schedules', label: 'Schedules' },
		{ value: 'stats', label: 'Stats' }
	];
	const seasonTypes = [
		{ value: 'regular', label: 'Regular' },
		{ value: 'postseason', label: 'Postseason' },
		{ value: 'preseason', label: 'Preseason' }
	];

	const syncSteps = $derived([
		{
			label: 'Teams',
			command: 'npm run db:seed',
			status: data.health.teams === 32 ? 'Ready' : 'Needs Sync',
			detail: `${data.health.teams}/32 teams`
		},
		{
			label: 'Rosters',
			command: 'npm run sync:rosters',
			status: data.health.players > 2500 ? 'Ready' : 'Needs Sync',
			detail: `${data.health.players} players`
		},
		{
			label: 'Schedules',
			command: `NFL_SEASON=${activeSeason} npm run sync:schedules`,
			status: data.health.activeSeasonGames > 0 ? 'Ready' : 'Needs Sync',
			detail: `${data.health.activeSeasonGames} active-season games`
		},
		{
			label: 'Stats',
			command: `NFL_SEASON=${activeSeason} npm run sync:stats`,
			status: data.health.activeSeasonStatRows > 0 ? 'Ready' : 'Needs Sync',
			detail: `${data.health.activeSeasonStatRows} ${activeSeasonType} stat rows`
		}
	]);
</script>

<svelte:head>
	<title>Data Sync | GridIron Admin</title>
</svelte:head>

<main class="min-h-screen bg-[#0d0f14] px-4 py-8 text-[#f0f2f5]">
	<section class="mx-auto max-w-6xl">
		<header
			class="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end"
		>
			<div>
				<a
					href="/admin/settings"
					class="text-xs font-black tracking-widest text-[#8a909e] uppercase transition hover:text-white"
				>
					Back to settings
				</a>
				<h1 class="mt-6 text-3xl font-black md:text-4xl">Data Sync</h1>
				<p class="mt-2 max-w-2xl text-sm leading-6 text-[#aeb4c0]">
					Monitor database coverage and run the sync commands for the active NFL season.
				</p>
			</div>

			<div class="border border-white/10 bg-[#161921] px-4 py-3">
				<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">
					Active Sync Target
				</div>
				<div class="mt-1 text-2xl font-black text-[#f5a623]">{activeSeason} {activeSeasonType}</div>
			</div>
		</header>

		<section class="mt-8 grid gap-4 md:grid-cols-3">
			<div class="border border-white/10 bg-[#161921] p-5">
				<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Teams</div>
				<div class="mt-2 text-3xl font-black">{data.health.teams}</div>
			</div>
			<div class="border border-white/10 bg-[#161921] p-5">
				<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Players</div>
				<div class="mt-2 text-3xl font-black">{data.health.players}</div>
			</div>
			<div class="border border-white/10 bg-[#161921] p-5">
				<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">All Stat Rows</div>
				<div class="mt-2 text-3xl font-black">{data.health.statRows}</div>
			</div>
			<div class="border border-white/10 bg-[#161921] p-5">
				<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">
					Active Stat Rows
				</div>
				<div class="mt-2 text-3xl font-black">{data.health.activeSeasonStatRows}</div>
			</div>
			<div class="border border-white/10 bg-[#161921] p-5">
				<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">All Games</div>
				<div class="mt-2 text-3xl font-black">{data.health.games}</div>
			</div>
			<div class="border border-white/10 bg-[#161921] p-5">
				<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Active Games</div>
				<div class="mt-2 text-3xl font-black">{data.health.activeSeasonGames}</div>
			</div>
		</section>

		<section class="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
			<div class="border border-white/10 bg-[#161921] p-5">
				<h2 class="text-lg font-black">Queue Sync Job</h2>
				<p class="mt-1 text-sm text-[#8a909e]">
					This creates a trackable job record. The worker runner is the next build step.
				</p>

				<form class="mt-5 space-y-4" method="post" action="?/queueJob" use:enhance>
					<label class="block">
						<span class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Job Type</span
						>
						<select
							class="mt-2 w-full border-white/10 bg-[#0d0f14] text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
							name="type"
						>
							{#each jobTypes as type}
								<option value={type.value}>{type.label}</option>
							{/each}
						</select>
					</label>

					<div class="grid gap-4 sm:grid-cols-2">
						<label class="block">
							<span class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Season</span
							>
							<input
								class="mt-2 w-full border-white/10 bg-[#0d0f14] text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
								name="season"
								type="number"
								min="2020"
								max="2035"
								value={activeSeason}
							/>
						</label>

						<label class="block">
							<span class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Type</span>
							<select
								class="mt-2 w-full border-white/10 bg-[#0d0f14] text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
								name="seasonType"
							>
								{#each seasonTypes as type}
									<option value={type.value} selected={type.value === activeSeasonType}>
										{type.label}
									</option>
								{/each}
							</select>
						</label>
					</div>

					<button
						class="w-full bg-[#f5a623] px-4 py-3 text-sm font-black text-[#11151d] transition hover:bg-[#ffbd4a]"
					>
						Queue Job
					</button>
				</form>

				{#if form?.message}
					<div
						class="mt-4 border border-[#f5a623]/30 bg-[#f5a623]/10 p-3 text-sm font-bold text-[#f5a623]"
					>
						{form.message}
					</div>
				{/if}
			</div>

			<div class="border border-white/10 bg-[#161921] p-5">
				<div class="flex items-center justify-between gap-3">
					<div>
						<h2 class="text-lg font-black">Recent Jobs</h2>
						<p class="mt-1 text-sm text-[#8a909e]">Most recent queued and completed sync jobs.</p>
					</div>
					<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">
						{data.jobs.length} shown
					</div>
				</div>

				{#if data.jobs.length}
					<div class="mt-5 overflow-x-auto">
						<table class="w-full min-w-[620px] text-left text-sm">
							<thead
								class="border-b border-white/10 text-xs font-black tracking-widest text-[#8a909e] uppercase"
							>
								<tr>
									<th class="py-3 pr-4">Job</th>
									<th class="py-3 pr-4">Target</th>
									<th class="py-3 pr-4">Status</th>
									<th class="py-3 pr-4">Requested</th>
									<th class="py-3">Message</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-white/10">
								{#each data.jobs as job}
									<tr>
										<td class="py-4 pr-4">
											<div class="font-black">#{job.id}</div>
											<div class="text-xs tracking-widest text-[#8a909e] uppercase">{job.type}</div>
										</td>
										<td class="py-4 pr-4 text-[#c6cad3]">
											{job.season} <span class="capitalize">{job.seasonType}</span>
										</td>
										<td class="py-4 pr-4">
											<span
												class={[
													'px-2 py-1 text-xs font-black tracking-widest uppercase',
													job.status === 'completed'
														? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
														: job.status === 'failed'
															? 'border border-red-400/30 bg-red-400/10 text-red-300'
															: job.status === 'running'
																? 'border border-sky-400/30 bg-sky-400/10 text-sky-300'
																: 'border border-[#f5a623]/30 bg-[#f5a623]/10 text-[#f5a623]'
												]}
											>
												{job.status}
											</span>
										</td>
										<td class="py-4 pr-4 text-[#c6cad3]">
											{new Date(job.createdAt).toLocaleString()}
										</td>
										<td class="py-4 text-[#aeb4c0]">{job.error ?? job.message ?? '-'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="mt-5 border border-white/10 bg-[#0d0f14] p-5 text-sm text-[#aeb4c0]">
						No sync jobs have been queued yet.
					</div>
				{/if}
			</div>
		</section>

		<section class="mt-8 border border-white/10 bg-[#161921] p-5">
			<div class="flex flex-col justify-between gap-3 md:flex-row md:items-end">
				<div>
					<h2 class="text-lg font-black">Sync Runbook</h2>
					<p class="mt-1 text-sm text-[#8a909e]">
						Run these commands from the project terminal or Coolify shell.
					</p>
				</div>
				<a
					class="bg-[#f5a623] px-4 py-3 text-sm font-black text-[#11151d] transition hover:bg-[#ffbd4a]"
					href="/admin/settings"
				>
					Change Season
				</a>
			</div>

			<div class="mt-5 grid gap-4 lg:grid-cols-2">
				{#each syncSteps as step}
					<article class="border border-white/10 bg-[#0d0f14] p-4">
						<div class="flex items-center justify-between gap-3">
							<h3 class="font-black">{step.label}</h3>
							<span
								class={[
									'px-2 py-1 text-xs font-black tracking-widest uppercase',
									step.status === 'Ready'
										? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
										: 'border border-[#f5a623]/30 bg-[#f5a623]/10 text-[#f5a623]'
								]}
							>
								{step.status}
							</span>
						</div>
						<div class="mt-2 text-sm text-[#aeb4c0]">{step.detail}</div>
						<code
							class="mt-4 block overflow-x-auto border border-white/10 bg-black/40 p-3 text-sm text-white"
						>
							{step.command}
						</code>
					</article>
				{/each}
			</div>
		</section>

		<section class="mt-8 border border-white/10 bg-[#161921] p-5">
			<h2 class="text-lg font-black">Season History</h2>
			{#if data.history.length}
				<div class="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
					{#each data.history as row}
						<div class="border border-white/10 bg-[#0d0f14] p-4">
							<div class="font-black">
								{row.season} <span class="text-[#8a909e] capitalize">{row.seasonType}</span>
							</div>
							<div class="mt-2 text-sm text-[#aeb4c0]">{row.statRows} stat rows</div>
							<div class="text-sm text-[#aeb4c0]">{row.scheduledGames} scheduled games</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="mt-3 text-sm text-[#aeb4c0]">
					No historical stat or schedule data has been synced yet.
				</p>
			{/if}
		</section>
	</section>
</main>
