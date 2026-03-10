#include <iostream>
using namespace std;

int main(void)
{
    int l, m;
    cin >> l >> m;
    
    bool trees[10001];
    for (int i = 0; i <= l; i++) {
        trees[i] = true;
    }
    
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        for (int j = u; j <= v; j++) {
            trees[j] = false;
        }
    }
    
    int count = 0;
    for (int i = 0; i <= l; i++) {
        if (trees[i]) {
            count++;
        }
    }
    
    cout << count << endl;
    
    return 0;
}