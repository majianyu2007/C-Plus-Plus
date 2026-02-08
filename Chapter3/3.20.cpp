
#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
	long long n = 0;
	if (!(cin >> n))
	{
		return 0;
	}

	bool first = true;
	for (long long p = 2; p * p <= n; ++p)
	{
		while (n % p == 0)
		{
			if (!first) cout << ", ";
			cout << p;
			first = false;
			n /= p;
		}
	}

	if (n > 1)
	{
		if (!first) cout << ", ";
		cout << n;
	}

	cout << endl;
	return 0;
}
