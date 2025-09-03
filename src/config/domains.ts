// List of supported email domains

export const DOMAINS = [
	{
		owner: "vwh",
		domain: "barid.site",
	},
	{
		owner: "vwh",
		domain: "vwh.sh",
	},
	{
		owner: "vwh",
		domain: "iusearch.lol",
	},
	{
		owner: "mm6x",
		domain: "lifetalk.us",
	},
	{
		owner: "z44d",
		domain: "z44d.pro",
	},
	{
		owner: "blockton",
		domain: "wael.fun",
	},
	{
		owner: "HprideH",
		domain: "tawbah.site",
	},
	{
		owner: "HprideH",
		domain: "kuruptd.ink",
	},
	{
		 owner: "oxno1",
		 domain: "oxno1.space",
    },
] satisfies {
	owner: string;
	domain: string;
}[];

export const DOMAINS_SET = new Set(DOMAINS.map((d) => d.domain));
