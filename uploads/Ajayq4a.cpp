#include <bits/stdc++.h>
using namespace std;

int n;

vector<long long> segtree[400025];
vector<long long>a;

void build(long long node,long long start,long long end)
{
	if(start==end)
	{
		segtree[node].push_back(a[end]);
		return;
	}
	int mid=start+(end-start)/2;
	build(2*node,start,mid);
	build(2*node+1,mid+1,end);
	segtree[node].resize(segtree[2*node].size()+segtree[2*node+1].size());
	merge(segtree[2*node].begin(),segtree[2*node].end(),segtree[2*node+1].begin(),segtree[2*node+1].end(),segtree[node].begin());
}

long long query(long long node,long long l,long long r,long long ql,long long qr,long long k)
{
	if(ql>r || qr<l)
	{
		return 0;
	}
	if(ql<=l && qr>=r)
	{
		return upper_bound(segtree[node].begin(),segtree[node].end(),k)-segtree[node].begin();
	}
	long long mid=l+(r-l)/2;
	long long p1=query(2*node,l,mid,ql,qr,k);
	long long p2=query(2*node+1,mid+1,r,ql,qr,k);
	return p1+p2;
}


int main()
{
	long long n;
	cin>>n;
	for(long long i=1;i<=n;i++)
	{
		long long x;
		cin>>x;
		a.push_back(x);
	}
	build(1,1,n);

	long long int q;
	cin>>q;
	for(;q>=1;q--)
	{
		long long l,r,k;
		cin>>l>>r>>k;
		cout<<query(1,1,n,l,r,k)<<endl;
	}
	return 0;
}
