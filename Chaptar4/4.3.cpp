#include <iostream>
#include <random>

using namespace std;

int main() {
	int a[99];

	random_device rd;
	mt19937 gen(rd());
	uniform_int_distribution<int> dist(1, 100);
	int missing = dist(gen);
	int idx = 0;
	for (int value = 1; value <= 100; ++value) {
		if (value == missing) {
			continue;
		}
		a[idx++] = value;
	}

	// cout << "随机缺失值(用于构造数组): " << missing << '\n';
	// cout << "数组已构造完成，元素个数: " << idx << '\n';
	// cout << "前10个元素: ";
	// for (int i = 0; i < 10; ++i) {
	// 	cout << a[i] << (i == 9 ? '\n' : ' ');
	// }

	int sumAll = (1 + 100) * 100 / 2;
	int sum{0};
	for (int i = 0; i < idx; i++)
	{
		sum += a[i];
	}
    int rmissing = sumAll - sum;
    cout << "The missing is: " << rmissing << endl;
	return 0;
}

